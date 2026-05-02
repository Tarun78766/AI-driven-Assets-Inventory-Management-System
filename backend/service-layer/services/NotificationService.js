const Query = require("../models/Query");
const User = require("../models/User");
const Assignment = require("../models/AssignmentModel");
const Employee = require("../models/EmployeeModel");
const LaptopModel = require("../models/LaptopModel");
const SoftwareModel = require("../models/SoftwareModel");
const IndividualSoftwareLicense = require("../models/IndividualSoftwareLicenseModel");

const MAX_NOTIFICATIONS = 15;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const daysFromNow = (date) => Math.ceil((new Date(date).getTime() - Date.now()) / MS_PER_DAY);
const daysAgo = (date) => Math.floor((Date.now() - new Date(date).getTime()) / MS_PER_DAY);

const makeNotification = ({ id, title, message, type, priority = "Medium", createdAt, unread = true }) => ({
  id,
  title,
  message,
  type,
  priority,
  createdAt,
  unread,
});

const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

const uniqueAndLimit = (notifications) => {
  const seen = new Set();

  return notifications
    .filter((notification) => {
      const key = `${notification.type}:${notification.id}:${notification.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort(byNewest)
    .slice(0, MAX_NOTIFICATIONS);
};

const getCurrentUser = async (userId) => {
  return User.findById(userId).select("firstName lastName email department role").lean();
};

const getEmployeeRecord = async (user) => {
  if (!user?.email) return null;
  return Employee.findOne({ email: user.email.toLowerCase() }).lean();
};

const buildEmployeeNotifications = async (userId) => {
  const user = await getCurrentUser(userId);
  const employeeRecord = await getEmployeeRecord(user);
  const notifications = [];

  const queries = await Query.find({ employeeId: userId })
    .sort({ updatedAt: -1 })
    .limit(8)
    .lean();

  queries.forEach((query) => {
    notifications.push(
      makeNotification({
        id: `query-${query._id}`,
        title: query.status === "Pending" ? "Query submitted" : "Query status updated",
        message: `${query.subject} is ${query.status}.`,
        type: "query",
        priority: query.priority || "Medium",
        createdAt: query.updatedAt || query.createdAt,
        unread: query.status !== "Resolved",
      }),
    );

    const latestMessage = [...(query.messages || [])]
      .reverse()
      .find((message) => String(message.senderId) !== String(userId));

    if (latestMessage) {
      notifications.push(
        makeNotification({
          id: `query-response-${query._id}`,
          title: "IT response received",
          message: `${latestMessage.senderName}: ${latestMessage.message}`,
          type: "query",
          priority: query.priority || "Medium",
          createdAt: latestMessage.createdAt,
        }),
      );
    }
  });

  if (employeeRecord) {
    const assignments = await Assignment.find({ employeeId: employeeRecord._id })
      .sort({ updatedAt: -1 })
      .limit(8)
      .lean();

    assignments.forEach((assignment) => {
      notifications.push(
        makeNotification({
          id: `assignment-${assignment._id}`,
          title: assignment.status === "Returned" ? "Asset returned" : `${assignment.assetType} assigned`,
          message: `${assignment.assetName || assignment.assetType} is ${assignment.status}.`,
          type: "assignment",
          priority: "Medium",
          createdAt: assignment.updatedAt || assignment.createdAt || assignment.assignDate,
          unread: assignment.status !== "Returned",
        }),
      );
    });

    const expiringLicenses = await IndividualSoftwareLicense.find({
      assignedTo: employeeRecord._id,
      expiryDate: { $exists: true, $ne: "" },
    })
      .sort({ expiryDate: 1 })
      .limit(10)
      .lean();

    expiringLicenses
      .filter((license) => {
        const days = daysFromNow(license.expiryDate);
        return days >= 0 && days <= 14;
      })
      .forEach((license) => {
        notifications.push(
          makeNotification({
            id: `license-expiry-${license._id}`,
            title: "Assigned software expiring soon",
            message: `${license.softwareName} expires in ${daysFromNow(license.expiryDate)} day(s).`,
            type: "alert",
            priority: daysFromNow(license.expiryDate) <= 7 ? "High" : "Medium",
            createdAt: license.updatedAt || license.createdAt,
          }),
        );
      });
  }

  return uniqueAndLimit(notifications);
};

const buildManagerNotifications = async (userId) => {
  const user = await getCurrentUser(userId);
  const notifications = [];
  const teamUsers = user?.department
    ? await User.find({ department: user.department, role: "employee" }).select("_id").lean()
    : [];
  const teamUserIds = teamUsers.map((teamUser) => teamUser._id);

  const teamQueries = await Query.find(teamUserIds.length ? { employeeId: { $in: teamUserIds } } : { _id: null })
    .sort({ updatedAt: -1 })
    .limit(12)
    .lean();

  teamQueries.forEach((query) => {
    const pendingDays = query.status === "Pending" ? daysAgo(query.createdAt) : 0;
    const isHighPriority = query.priority === "High";

    notifications.push(
      makeNotification({
        id: `team-query-${query._id}`,
        title: isHighPriority ? "High priority query" : "New query from team",
        message: `${query.employeeName}: ${query.subject}`,
        type: "query",
        priority: query.priority || "Medium",
        createdAt: query.updatedAt || query.createdAt,
      }),
    );

    if (pendingDays > 3) {
      notifications.push(
        makeNotification({
          id: `team-query-pending-${query._id}`,
          title: "Pending query needs attention",
          message: `${query.subject} has been pending for ${pendingDays} days.`,
          type: "query",
          priority: "High",
          createdAt: query.createdAt,
        }),
      );
    }
  });

  const teamEmployees = user?.department
    ? await Employee.find({ department: user.department }).select("_id name").lean()
    : [];
  const teamEmployeeIds = teamEmployees.map((employee) => employee._id);

  const assignments = await Assignment.find(teamEmployeeIds.length ? { employeeId: { $in: teamEmployeeIds } } : { _id: null })
    .sort({ updatedAt: -1 })
    .limit(10)
    .lean();

  assignments.forEach((assignment) => {
    notifications.push(
      makeNotification({
        id: `team-assignment-${assignment._id}`,
        title: assignment.status === "Return Requested" ? "Asset request from employee" : "Asset assigned to team",
        message: `${assignment.employeeName || "Team member"}: ${assignment.assetName || assignment.assetType}`,
        type: "assignment",
        priority: assignment.status === "Return Requested" ? "High" : "Medium",
        createdAt: assignment.updatedAt || assignment.createdAt || assignment.assignDate,
      }),
    );
  });

  return uniqueAndLimit(notifications);
};

const buildAdminNotifications = async () => {
  const notifications = [];

  const queries = await Query.find({})
    .sort({ updatedAt: -1 })
    .limit(12)
    .lean();

  queries.forEach((query) => {
    const pendingDays = query.status === "Pending" ? daysAgo(query.createdAt) : 0;

    notifications.push(
      makeNotification({
        id: `admin-query-${query._id}`,
        title: query.priority === "High" ? "High priority query alert" : "New query created",
        message: `${query.employeeName}: ${query.subject}`,
        type: "query",
        priority: query.priority || "Medium",
        createdAt: query.updatedAt || query.createdAt,
      }),
    );

    if (pendingDays > 3) {
      notifications.push(
        makeNotification({
          id: `admin-query-pending-${query._id}`,
          title: "Query pending too long",
          message: `${query.subject} has been pending for ${pendingDays} days.`,
          type: "query",
          priority: "High",
          createdAt: query.createdAt,
        }),
      );
    }
  });

  const software = await SoftwareModel.find({}).sort({ expiryDate: 1 }).limit(20).lean();
  software.forEach((item) => {
    const expiryDays = daysFromNow(item.expiryDate);
    const totalLicenses = Number(item.totalLicenses || 0);
    const usedLicenses = Number(item.usedLicenses || 0);

    if (expiryDays >= 0 && expiryDays <= 7) {
      notifications.push(
        makeNotification({
          id: `software-expiry-${item._id}`,
          title: "Expiring software",
          message: `${item.name} expires in ${expiryDays} day(s).`,
          type: "inventory",
          priority: "High",
          createdAt: item.updatedAt || item.createdAt,
        }),
      );
    }

    if (totalLicenses > 0 && usedLicenses / totalLicenses >= 0.9) {
      notifications.push(
        makeNotification({
          id: `license-limit-${item._id}`,
          title: "License nearing limit",
          message: `${item.name} is using ${usedLicenses}/${totalLicenses} licenses.`,
          type: "inventory",
          priority: "Medium",
          createdAt: item.updatedAt || item.createdAt,
        }),
      );
    }
  });

  const laptops = await LaptopModel.find({}).sort({ updatedAt: -1 }).limit(20).lean();
  laptops.forEach((laptop) => {
    const available = Number(laptop.totalAssets || 0) - Number(laptop.inUse || 0) - Number(laptop.underRepair || 0);
    if (available <= 3) {
      notifications.push(
        makeNotification({
          id: `low-stock-${laptop._id}`,
          title: "Low stock alert",
          message: `${laptop.brand} ${laptop.modelName} has ${Math.max(available, 0)} available unit(s).`,
          type: "inventory",
          priority: available <= 1 ? "High" : "Medium",
          createdAt: laptop.updatedAt || laptop.createdAt,
        }),
      );
    }
  });

  return uniqueAndLimit(notifications);
};

const getRoleBasedNotifications = async ({ userId, role }) => {
  const normalizedRole = String(role || "").toLowerCase();

  if (normalizedRole === "employee") {
    return buildEmployeeNotifications(userId);
  }

  if (normalizedRole === "manager") {
    return buildManagerNotifications(userId);
  }

  if (normalizedRole === "admin") {
    return buildAdminNotifications();
  }

  return [];
};

module.exports = {
  getRoleBasedNotifications,
};
