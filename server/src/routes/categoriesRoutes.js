const express = require("express");
const categoriesController = require("../controllers/categoryController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/create",authMiddleware, categoriesController.createCategory);
router.get("/getAll",categoriesController.getCategories);
router.get("/get/:id", categoriesController.getCategoryById);
router.put("/update/:id",authMiddleware, categoriesController.updateCategory);
router.delete("/delete/:id",authMiddleware, categoriesController.deleteCategory);

module.exports = router;