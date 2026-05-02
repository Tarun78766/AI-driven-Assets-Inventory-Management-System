const Query = require("../models/Query");
const User = require("../models/User");
const {
  sendQueryNotificationEmail,
  sendQueryConfirmationEmail,
} = require("../notifications/QueryEmailService");

const buildEmployeeSnapshot = async (userId) => {
  const user = await User.findById(userId).select("firstName lastName email").lean();

  if (!user) {
    const error = new Error("Authenticated user not found.");
    error.statusCode = 401;
    throw error;
  }

  return {
    employeeName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
    employeeEmail: user.email,
  };
};

const createQuery = async ({ userId, body }) => {
  const { queryType, subject, description, priority = "Medium", assignedTo } = body;

  if (!queryType || !subject?.trim() || !description?.trim()) {
    const error = new Error("Query type, subject, and description are required.");
    error.statusCode = 400;
    throw error;
  }

  const employee = await buildEmployeeSnapshot(userId);
  let assigneeEmail = null;

  if (assignedTo) {
    const assignee = await User.findById(assignedTo).select("email").lean();
    if (assignee) {
      assigneeEmail = assignee.email;
    }
  }

  const query = await Query.create({
    employeeId: userId,
    employeeName: employee.employeeName,
    employeeEmail: employee.employeeEmail,
    queryType,
    subject: subject.trim(),
    description: description.trim(),
    priority,
    status: "Pending",
    assignedTo: assignedTo || null,
  });

  sendQueryNotificationEmail(query, assigneeEmail).catch((error) => {
    console.error("[QueryEmail] Notification email failed:", error.message);
  });
  sendQueryConfirmationEmail(query).catch((error) => {
    console.error("[QueryEmail] Confirmation email failed:", error.message);
  });

  return query;
};

const getMyQueries = async ({ userId, page = 1, limit = 10, status, queryType }) => {
  const filter = { employeeId: userId };
  if (status) filter.status = status;
  if (queryType) filter.queryType = queryType;

  const skip = (page - 1) * limit;
  const [total, queries] = await Promise.all([
    Query.countDocuments(filter),
    Query.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
  ]);

  return {
    queries,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getQueryById = async ({ queryId, userId, role }) => {
  const query = await Query.findById(queryId)
    .populate("employeeId", "firstName lastName email department")
    .populate("assignedTo", "firstName lastName email")
    .lean();

  if (!query) {
    const error = new Error("Query not found.");
    error.statusCode = 404;
    throw error;
  }

  if (role === "employee" && query.employeeId._id.toString() !== userId.toString()) {
    const error = new Error("Access denied.");
    error.statusCode = 403;
    throw error;
  }

  return query;
};

const getAllQueries = async ({ page = 1, limit = 10, status, queryType, priority }) => {
  const filter = {};
  if (status) filter.status = status;
  if (queryType) filter.queryType = queryType;
  if (priority) filter.priority = priority;

  const skip = (page - 1) * limit;
  const [total, queries] = await Promise.all([
    Query.countDocuments(filter),
    Query.find(filter)
      .populate("employeeId", "firstName lastName email department")
      .populate("assignedTo", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  return {
    queries,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateQuery = async ({ queryId, updates }) => {
  const allowedFields = ["status", "assignedTo", "priority"];
  const sanitized = {};

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      sanitized[field] = updates[field];
    }
  });

  if (sanitized.status === "Resolved") {
    sanitized.resolvedAt = new Date();
  }

  if (sanitized.status && sanitized.status !== "Resolved") {
    sanitized.resolvedAt = null;
  }

  const query = await Query.findByIdAndUpdate(
    queryId,
    { $set: sanitized },
    { new: true, runValidators: true },
  ).lean();

  if (!query) {
    const error = new Error("Query not found.");
    error.statusCode = 404;
    throw error;
  }

  return query;
};

const deleteQuery = async (queryId) => {
  const query = await Query.findByIdAndDelete(queryId);

  if (!query) {
    const error = new Error("Query not found.");
    error.statusCode = 404;
    throw error;
  }

  return { message: "Query deleted successfully." };
};

const replyToQuery = async ({ queryId, userId, message }) => {
  if (!message?.trim()) {
    const error = new Error("Message content is required.");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId).select("firstName lastName role").lean();
  if (!user) {
    const error = new Error("User not found.");
    error.statusCode = 404;
    throw error;
  }

  const senderName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown User";

  const query = await Query.findByIdAndUpdate(
    queryId,
    {
      $push: {
        messages: {
          senderId: userId,
          senderName,
          senderRole: user.role,
          message: message.trim()
        }
      }
    },
    { new: true }
  ).lean();

  if (!query) {
    const error = new Error("Query not found.");
    error.statusCode = 404;
    throw error;
  }

  // TODO: Trigger email notification to the other party (Admin -> Employee or Employee -> Admin)

  return query;
};

const getQueryStats = async () => {
  const [statusStats, priorityStats] = await Promise.all([
    Query.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Query.aggregate([{ $group: { _id: "$priority", count: { $sum: 1 } } }]),
  ]);

  return { statusStats, priorityStats };
};

module.exports = {
  createQuery,
  getMyQueries,
  getQueryById,
  getAllQueries,
  updateQuery,
  deleteQuery,
  getQueryStats,
  replyToQuery,
};
