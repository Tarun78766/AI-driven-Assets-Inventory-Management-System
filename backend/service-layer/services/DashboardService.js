const LaptopModel = require("../models/LaptopModel");
const SoftwareModel = require("../models/SoftwareModel");
const AssignmentModel = require("../models/AssignmentModel");

const getDashboardData = async () => {
  // ========================
  // 1. LAPTOP STATS
  // ========================
  const laptopStats = await LaptopModel.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$totalAssets" },
        inUse: { $sum: "$inUse" },
        underRepair: { $sum: "$underRepair" },
      },
    },
  ]);

  const laptops = laptopStats[0] || {
    total: 0,
    inUse: 0,
    underRepair: 0,
  };

  laptops.available = laptops.total - (laptops.inUse + laptops.underRepair);

  // ========================
  // 2. SOFTWARE STATS
  // ========================
  const softwareStats = await SoftwareModel.aggregate([
    {
      $group: {
        _id: null,
        totalLicenses: { $sum: "$totalLicenses" },
        usedLicenses: { $sum: "$usedLicenses" },
      },
    },
  ]);

  const software = softwareStats[0] || {
    totalLicenses: 0,
    usedLicenses: 0,
  };

  software.availableLicenses =
    software.totalLicenses - software.usedLicenses;

  // ========================
  // 3. ASSIGNMENTS STATS
  // ========================
  const totalAssignments = await AssignmentModel.countDocuments();
  const activeAssignments = await AssignmentModel.countDocuments({
    status: "Assigned",
  });
  const returnedAssignments = await AssignmentModel.countDocuments({
    status: "Returned",
  });

  // ========================
  // 4. RECENT ACTIVITY 🔥
  // ========================
  const recentAssignments = await AssignmentModel.find()
    .sort({ createdAt: -1 })
    .limit(5);

  const activity = recentAssignments.map((a) => ({
    id: a._id,
    action:
      a.status === "Returned"
        ? "Asset returned"
        : "Asset assigned",
    item: a.assetName,
    employee: a.employeeName,
    time: a.createdAt,
    status: a.status === "Returned" ? "warning" : "success",
  }));

  // ========================
  // 5. LOW STOCK ALERTS 🔥
  // ========================
  const laptopAlerts = await LaptopModel.find({
    $expr: {
      $lt: [
        {
          $subtract: [
            "$totalAssets",
            { $add: ["$inUse", "$underRepair"] },
          ],
        },
        5, // threshold
      ],
    },
  }).limit(5);

  const softwareAlerts = await SoftwareModel.find({
    $expr: {
      $lt: [
        { $subtract: ["$totalLicenses", "$usedLicenses"] },
        5,
      ],
    },
  }).limit(5);

  const alerts = [
    ...laptopAlerts.map((l) => ({
      id: l._id,
      item: l.modelName,
      stock:
        l.totalAssets - (l.inUse + l.underRepair),
      threshold: 5,
    })),
    ...softwareAlerts.map((s) => ({
      id: s._id,
      item: s.name,
      stock: s.totalLicenses - s.usedLicenses,
      threshold: 5,
    })),
  ];

  return {
    laptops,
    software,
    assignments: {
      total: totalAssignments,
      active: activeAssignments,
      returned: returnedAssignments,
    },
    activity,
    alerts,
  };
};

module.exports = { getDashboardData };