const express = require("express");
const multer = require("multer");
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
require("dotenv").config();
const careersController = require("../controllers/careerController");
const { authMiddleware } = require("../middlewares/authMiddleware"); 

const router = express.Router();





router.post("/create",authMiddleware, careersController.createCareer);
router.get("/getAll", careersController.getAllCareers);
router.get("/get/:id", careersController.getCareerById);
router.put("/update/:id",authMiddleware,  careersController.updateCareer);
router.delete("/delete/:id",authMiddleware, careersController.deleteCareer);
router.get("/search", careersController.searchCareers);

module.exports = router;
