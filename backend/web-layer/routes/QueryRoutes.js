const express = require("express");
const router = express.Router();

const queryController = require("../controllers/QueryController");
const authMiddleware = require("../middlewares/AuthMiddleware");
const restrictTo = authMiddleware.restrictTo;

router.use(authMiddleware);

router.post(
  "/",
  restrictTo("employee"),
  queryController.submitQuery,
);
router.get(
  "/my",
  restrictTo("employee"),
  queryController.getMyQueries,
);

router.get(
  "/stats",
  restrictTo("manager", "admin"),
  queryController.getQueryStats,
);
router.get("/", restrictTo("manager", "admin"), queryController.getAllQueries);
router.patch("/:id", restrictTo("manager", "admin"), queryController.updateQuery);
router.delete("/:id", restrictTo("admin"), queryController.deleteQuery);

router.get(
  "/:id",
  restrictTo("employee"),
  queryController.getQueryById,
);

router.post(
  "/:id/reply",
  restrictTo("employee", "manager", "admin"),
  queryController.replyToQuery
);

module.exports = router;
