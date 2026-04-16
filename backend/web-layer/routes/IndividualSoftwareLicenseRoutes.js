const express = require("express");
const router = express.Router();

const individualSoftwareController = require("../controllers/IndividualSoftwareLicenseController");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * Individual Software License Routes
 * (Mounted at /api/individual-software in app.js)
 */

router.use(authMiddleware);

// POST /api/individual-software
router.post("/", individualSoftwareController.addSoftwareLicenseSeat);

// GET /api/individual-software
router.get("/", individualSoftwareController.getAllSoftwareLicenseSeats);

// GET /api/individual-software/:id
router.get("/:id", individualSoftwareController.getSoftwareLicenseSeatById);

// PUT /api/individual-software/:id
router.put("/:id", individualSoftwareController.updateSoftwareLicenseSeat);

// DELETE /api/individual-software/:id
router.delete("/:id", individualSoftwareController.removeSoftwareLicenseSeat);

module.exports = router;
