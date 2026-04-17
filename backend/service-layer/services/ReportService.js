const AssignmentModel = require("../models/AssignmentModel");
const EmployeeModel = require("../models/EmployeeModel");
const IndividualLaptopModel = require("../models/IndividualLaptopModel");
const LaptopModel = require("../models/LaptopModel");
const SoftwareModel = require("../models/SoftwareModel");

const LAPTOP_REPLACEMENT_MONTHS = 36;
const FORECAST_YEARS = 4;
const FORECAST_GROWTH_RATE = 0.05;
const HISTORY_MONTHS = 6;

const getMonthDifference = (startDate, endDate = new Date()) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return (
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth())
  );
};

const getLifecycleStatus = (ageInMonths, currentStatus) => {
  if (currentStatus === "Retired") {
    return "Expired";
  }

  if (ageInMonths >= LAPTOP_REPLACEMENT_MONTHS) {
    return "Expired";
  }

  if (ageInMonths >= LAPTOP_REPLACEMENT_MONTHS - 6) {
    return "Replace Soon";
  }

  return "Active";
};

const getSoftwareStatus = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.ceil((expiry - today) / msPerDay);

  let status = "Active";

  if (daysLeft <= 0) {
    status = "Expired";
  } else if (daysLeft <= 30) {
    status = "Critical";
  } else if (daysLeft <= 90) {
    status = "Upcoming";
  }

  return { daysLeft, status };
};

const formatMonthLabel = (date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

const buildAssignmentHistory = async () => {
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth() - (HISTORY_MONTHS - 1), 1);

  const assignments = await AssignmentModel.find({
    assignDate: { $gte: startMonth },
  }).select("assetType assignDate");

  const historyMap = new Map();

  for (let index = 0; index < HISTORY_MONTHS; index += 1) {
    const monthDate = new Date(startMonth.getFullYear(), startMonth.getMonth() + index, 1);
    const key = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;

    historyMap.set(key, {
      month: formatMonthLabel(monthDate),
      laptops: 0,
      software: 0,
      total: 0,
    });
  }

  assignments.forEach((assignment) => {
    const assignDate = new Date(assignment.assignDate);
    const key = `${assignDate.getFullYear()}-${assignDate.getMonth()}`;
    const entry = historyMap.get(key);

    if (!entry) {
      return;
    }

    if (assignment.assetType === "Laptop") {
      entry.laptops += 1;
    }

    if (assignment.assetType === "Software") {
      entry.software += 1;
    }

    entry.total += 1;
  });

  return Array.from(historyMap.values());
};

const buildLifecycleData = async () => {
  const laptops = await IndividualLaptopModel.find()
    .populate("assignedTo", "name")
    .sort({ purchaseDate: 1 });

  return laptops.map((laptop) => {
    const age = getMonthDifference(laptop.purchaseDate);
    const status = getLifecycleStatus(age, laptop.status);

    return {
      id: laptop._id,
      assetName: `${laptop.modelName} #${laptop.serialNumber}`,
      type: "Laptop",
      purchaseDate: laptop.purchaseDate,
      age,
      status,
      assignedTo: laptop.assignedTo?.name || "Unassigned",
      condition: laptop.conditionNotes?.trim() || (laptop.status === "Under Repair" ? "Needs Attention" : "Good"),
    };
  });
};

const buildSoftwareExpiryData = async () => {
  const softwareList = await SoftwareModel.find().sort({ expiryDate: 1 });

  return softwareList.map((software) => {
    const { daysLeft, status } = getSoftwareStatus(software.expiryDate);

    return {
      id: software._id,
      name: software.name,
      vendor: software.vendor,
      expiryDate: software.expiryDate,
      daysLeft,
      status,
      licenses: software.totalLicenses,
      cost: software.cost,
    };
  });
};

const buildDepartmentAllocation = async () => {
  const departmentData = await EmployeeModel.aggregate([
    {
      $group: {
        _id: "$department",
        laptops: { $sum: "$assignedLaptops" },
        software: { $sum: "$assignedSoftware" },
        employees: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        department: "$_id",
        laptops: 1,
        software: 1,
        employees: 1,
      },
    },
    {
      $sort: { laptops: -1, software: -1, department: 1 },
    },
  ]);

  return departmentData;
};

const buildUtilization = async () => {
  const laptopStats = await IndividualLaptopModel.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        inUse: {
          $sum: {
            $cond: [{ $eq: ["$status", "Assigned"] }, 1, 0],
          },
        },
        available: {
          $sum: {
            $cond: [{ $eq: ["$status", "Available"] }, 1, 0],
          },
        },
        underRepair: {
          $sum: {
            $cond: [{ $eq: ["$status", "Under Repair"] }, 1, 0],
          },
        },
      },
    },
  ]);

  const softwareStats = await SoftwareModel.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$totalLicenses" },
        inUse: { $sum: "$usedLicenses" },
      },
    },
  ]);

  const laptopSummary = laptopStats[0] || {
    total: 0,
    inUse: 0,
    available: 0,
    underRepair: 0,
  };

  const softwareSummary = softwareStats[0] || {
    total: 0,
    inUse: 0,
  };

  const softwareAvailable = Math.max(softwareSummary.total - softwareSummary.inUse, 0);

  return [
    {
      category: "Laptops",
      total: laptopSummary.total,
      inUse: laptopSummary.inUse,
      available: laptopSummary.available,
      underRepair: laptopSummary.underRepair,
      utilization:
        laptopSummary.total > 0
          ? Math.round((laptopSummary.inUse / laptopSummary.total) * 100)
          : 0,
    },
    {
      category: "Software",
      total: softwareSummary.total,
      inUse: softwareSummary.inUse,
      available: softwareAvailable,
      expired: 0,
      utilization:
        softwareSummary.total > 0
          ? Math.round((softwareSummary.inUse / softwareSummary.total) * 100)
          : 0,
    },
  ];
};

const buildForecast = (
  currentEmployees,
  laptopRatio,
  softwareRatio,
  averageLaptopCost,
  averageSoftwareCost
) => {
  const currentYear = new Date().getFullYear();
  const forecast = [];

  for (let index = 0; index < FORECAST_YEARS; index += 1) {
    const growthMultiplier = Math.pow(1 + FORECAST_GROWTH_RATE, index);
    const employees = Math.round(currentEmployees * growthMultiplier);
    const laptops = Math.round(employees * laptopRatio);
    const software = Math.round(employees * softwareRatio);
    const totalCost = Math.round(
      laptops * averageLaptopCost + software * averageSoftwareCost
    );

    forecast.push({
      year: currentYear + index,
      employees,
      laptops,
      software,
      totalCost,
    });
  }

  return forecast;
};

const getReportsData = async () => {
  const [
    lifecycleData,
    softwareExpiry,
    assignmentHistory,
    departmentAllocation,
    assetUtilization,
    employeeCount,
  ] = await Promise.all([
    buildLifecycleData(),
    buildSoftwareExpiryData(),
    buildAssignmentHistory(),
    buildDepartmentAllocation(),
    buildUtilization(),
    EmployeeModel.countDocuments({ status: "Active" }),
  ]);

  const laptopUtilization = assetUtilization.find((item) => item.category === "Laptops") || {
    total: 0,
    inUse: 0,
  };
  const softwareUtilization = assetUtilization.find((item) => item.category === "Software") || {
    total: 0,
    inUse: 0,
  };

  const totalAssets = laptopUtilization.total + softwareUtilization.total;
  const activeAssignments = laptopUtilization.inUse + softwareUtilization.inUse;
  const expiringLicenses = softwareExpiry.filter((item) => item.daysLeft <= 90).length;
  const replacementDue = lifecycleData.filter((item) =>
    ["Replace Soon", "Expired"].includes(item.status)
  ).length;
  const avgUtilization =
    totalAssets > 0 ? Math.round((activeAssignments / totalAssets) * 100) : 0;

  const totalLaptopValue = await LaptopModel.aggregate([
    {
      $group: {
        _id: null,
        totalAssets: { $sum: "$totalAssets" },
        totalValue: {
          $sum: {
            $multiply: ["$totalAssets", "$price"],
          },
        },
      },
    },
  ]);

  const totalSoftwareValue = await SoftwareModel.aggregate([
    {
      $group: {
        _id: null,
        totalLicenses: { $sum: "$totalLicenses" },
        totalValue: {
          $sum: {
            $multiply: ["$totalLicenses", "$cost"],
          },
        },
      },
    },
  ]);

  const laptopInventory = totalLaptopValue[0] || { totalAssets: 0, totalValue: 0 };
  const softwareInventory = totalSoftwareValue[0] || { totalLicenses: 0, totalValue: 0 };

  const laptopRatio =
    employeeCount > 0 ? laptopInventory.totalAssets / employeeCount : 0;
  const softwareRatio =
    employeeCount > 0 ? softwareInventory.totalLicenses / employeeCount : 0;
  const averageLaptopCost =
    laptopInventory.totalAssets > 0
      ? laptopInventory.totalValue / laptopInventory.totalAssets
      : 0;
  const averageSoftwareCost =
    softwareInventory.totalLicenses > 0
      ? softwareInventory.totalValue / softwareInventory.totalLicenses
      : 0;

  const growthForecast = buildForecast(
    employeeCount,
    laptopRatio,
    softwareRatio,
    averageLaptopCost,
    averageSoftwareCost
  );

  const topDepartments = [...departmentAllocation]
    .sort((left, right) => right.laptops + right.software - (left.laptops + left.software))
    .slice(0, 5);

  return {
    stats: {
      totalAssets,
      activeAssignments,
      expiringLicenses,
      replacementDue,
      avgUtilization,
      forecastGrowth: Math.round(FORECAST_GROWTH_RATE * 100),
    },
    assignmentHistory,
    lifecycleData,
    softwareExpiry,
    growthForecast,
    assetUtilization,
    departmentAllocation,
    topDepartments,
  };
};

module.exports = {
  getReportsData,
};
