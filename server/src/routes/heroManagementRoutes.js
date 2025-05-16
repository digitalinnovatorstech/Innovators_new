const express = require("express");
const heroManagementController = require("../controllers/heroManagementController");
const { authMiddleware } = require("../middlewares/authMiddleware"); 
const router = express.Router();

router.post("/create",authMiddleware, heroManagementController.createHeroManagement);
router.get("/get", heroManagementController.getHeroManagement);
router.get("/get/:id", heroManagementController.getHeroManagementById);
router.put("/update/:id", heroManagementController.updateHeroManagement);
router.delete("/delete/:id",authMiddleware, heroManagementController.deleteHeroManagement);
router.get("/search", heroManagementController.searchHeroSections);


module.exports = router;