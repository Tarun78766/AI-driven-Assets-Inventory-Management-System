const LaptopModel = require("../models/LaptopModel");
const IndividualLaptopModel = require("../models/IndividualLaptopModel");
const SoftwareModel = require("../models/SoftwareModel");
const IndividualSoftwareLicenseModel = require("../models/IndividualSoftwareLicenseModel");
const EmployeeModel = require("../models/EmployeeModel");
const AssignmentModel = require("../models/AssignmentModel");

/**
 * DashboardService
 * Aggregates statistics across the entire database for the frontend dashboard.
 */

const getDashboardStats = async () => {
  // 1. STATS (Top Four Cards)
  const totalLaptops = await IndividualLaptopModel.countDocuments();

  // Software represents "Total Products we use".
  const totalSoftware = await SoftwareModel.countDocuments();

  const activeEmployees = await EmployeeModel.countDocuments();

  // Only count active assignments currently held by employees, not returned ones
  const activeAssignments = await AssignmentModel.countDocuments({
    status: "Active",
  });

  const stats = {
    totalLaptops,
    totalSoftware,
    activeEmployees,
    totalAssignments: activeAssignments,
  };

  // 2. QUICK STATS (Bottom Bars)
  const availableLaptops = await IndividualLaptopModel.countDocuments({
    status: "Available",
  });
  const inUseLaptops = await IndividualLaptopModel.countDocuments({
    status: "Assigned",
  });
  const underMaintenanceLaptops = await IndividualLaptopModel.countDocuments({
    status: "Under Repair",
  });

  // Summing up total software licenses vs used
  const softwareAggregation = await SoftwareModel.aggregate([
    {
      $group: {
        _id: null,
        totalLicensesSum: { $sum: "$totalLicenses" },
        usedLicensesSum: { $sum: "$usedLicenses" },
      },
    },
  ]);

  let totalSoftwareLicenses = 0;
  let usedSoftwareLicenses = 0;

  if (softwareAggregation.length > 0) {
    totalSoftwareLicenses = softwareAggregation[0].totalLicensesSum;
    usedSoftwareLicenses = softwareAggregation[0].usedLicensesSum;
  }

  const quickStats = {
    availableLaptops,
    inUseLaptops,
    underMaintenance: underMaintenanceLaptops,
    softwareLicenses: {
      total: totalSoftwareLicenses,
      used: usedSoftwareLicenses,
    },
  };

  // 3. RECENT ACTIVITY
  // Fetch the 5 most recent history entries
  const recentAssignments = await AssignmentModel.find()
    .sort({ createdAt: -1 })
    .limit(5);

  const recentActivity = recentAssignments.map((a) => {
    // Determine friendly text action and status based on action
    let actionText = "";
    let statusText = "success";

    if (a.status === "Active") {
      actionText =
        a.assetType === "Laptop" ? "Laptop assigned" : "Software installed";
      statusText = "success";
    } else {
      actionText =
        a.assetType === "Laptop" ? "Laptop returned" : "Software revoked";
      statusText = "warning";
    }

    // Rough approximation of "Time Ago" based on standard ISO Date Output
    // The frontend can parse this better if we pass ISO directly, or we format it.
    const timeAgo = a.updatedAt;

    return {
      id: a._id.toString(),
      action: actionText,
      item: a.assetName,
      employee: a.employeeName,
      time: timeAgo,
      status: statusText,
    };
  });

  // 4. LOW STOCK ALERTS
  // We will mathematically calculate stock warnings. Custom threshold is 5.
  const THRESHOLD = 5;
  const lowStockAlerts = [];

  // Find laptops grouped by Model that have very few "Available" left
  const availableLaptopsByGroup = await IndividualLaptopModel.aggregate([
    { $match: { status: "Available" } },
    {
      $group: {
        _id: "$laptopModelId",
        count: { $sum: 1 },
        modelName: { $first: "$modelName" },
      },
    },
  ]);

  availableLaptopsByGroup.forEach((group) => {
    if (group.count <= THRESHOLD) {
      lowStockAlerts.push({
        id: `LAP-${group._id}`,
        item: group.modelName,
        stock: group.count,
        threshold: THRESHOLD,
      });
    }
  });

  // Find software that is almost fully consumed
  const lowSoftwareKeys = await SoftwareModel.find({
    $expr: {
      $lte: [{ $subtract: ["$totalLicenses", "$usedLicenses"] }, THRESHOLD],
    },
  });

  lowSoftwareKeys.forEach((sw) => {
    const remaining = sw.totalLicenses - sw.usedLicenses;
    lowStockAlerts.push({
      id: `SW-${sw._id}`,
      item: `${sw.name} License`,
      stock: remaining,
      threshold: THRESHOLD,
    });
  });

  // Construct Final Master Object
  return {
    stats,
    quickStats,
    recentActivity,
    lowStockAlerts,
  };
};

module.exports = {
  getDashboardStats,
};
