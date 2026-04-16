const express = require("express");
const router = express.Router();
const laptopModelController = require("../controllers/LaptopModelController");
const authMiddleware = require("../middlewares/authMiddleware");
const restrictTo = authMiddleware.restrictTo;

router.use(authMiddleware);

router.get("/", restrictTo("admin", "manager"), laptopModelController.getAllLaptopModels);
router.get("/:id", restrictTo("admin", "manager"), laptopModelController.getLaptopModelById);
router.post("/", restrictTo("admin", "manager"), laptopModelController.createLaptopModel);
router.put("/:id", restrictTo("admin", "manager"), laptopModelController.updateLaptopModel);
router.delete("/:id", restrictTo("admin", "manager"), laptopModelController.deleteLaptopModel);

module.exports = router;