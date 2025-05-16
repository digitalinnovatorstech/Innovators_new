const express = require("express");
const settingsController = require("../controllers/settingsController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create",authMiddleware, settingsController.createSettings);   
router.put("/update/:id",authMiddleware, settingsController.updateSettings); 
router.get("/getAll",authMiddleware, settingsController.getSettings);       

module.exports = router;
