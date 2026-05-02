const queryService = require("../../service-layer/services/QueryService");

const handleError = (res, error) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || "Something went wrong.",
  });
};

const submitQuery = async (req, res) => {
  try {
    const query = await queryService.createQuery({
      userId: req.user.id,
      body: req.body,
    });

    res.status(201).json({
      success: true,
      message: "Query submitted successfully.",
      data: query,
    });
  } catch (error) {
    handleError(res, error);
  }
};

const getMyQueries = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, queryType } = req.query;
    const result = await queryService.getMyQueries({
      userId: req.user.id,
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      queryType,
    });

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    handleError(res, error);
  }
};

const getQueryById = async (req, res) => {
  try {
    const query = await queryService.getQueryById({
      queryId: req.params.id,
      userId: req.user.id,
      role: req.user.role,
    });

    res.status(200).json({ success: true, data: query });
  } catch (error) {
    handleError(res, error);
  }
};

const getAllQueries = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, queryType, priority } = req.query;
    const result = await queryService.getAllQueries({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      queryType,
      priority,
    });

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    handleError(res, error);
  }
};

const updateQuery = async (req, res) => {
  try {
    const query = await queryService.updateQuery({
      queryId: req.params.id,
      updates: req.body,
    });

    res.status(200).json({
      success: true,
      message: "Query updated successfully.",
      data: query,
    });
  } catch (error) {
    handleError(res, error);
  }
};

const deleteQuery = async (req, res) => {
  try {
    const result = await queryService.deleteQuery(req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    handleError(res, error);
  }
};

const getQueryStats = async (req, res) => {
  try {
    const stats = await queryService.getQueryStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    handleError(res, error);
  }
};

const replyToQuery = async (req, res) => {
  try {
    const query = await queryService.replyToQuery({
      queryId: req.params.id,
      userId: req.user.id,
      message: req.body.message,
    });

    res.status(200).json({
      success: true,
      message: "Reply added successfully.",
      data: query,
    });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  submitQuery,
  getMyQueries,
  getQueryById,
  getAllQueries,
  updateQuery,
  deleteQuery,
  getQueryStats,
  replyToQuery,
};
