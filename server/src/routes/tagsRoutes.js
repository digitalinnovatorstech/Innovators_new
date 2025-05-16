const express = require("express");
const tagsController = require("../controllers/tagsController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/create",authMiddleware, tagsController.createTag);
router.get("/getAll",authMiddleware, tagsController.getTags);
router.get("/get/:id",authMiddleware, tagsController.getTagById);
router.put("/update/:id",authMiddleware, tagsController.updateTag);
router.delete("/delete/:id",authMiddleware, tagsController.deleteTag);

module.exports = router;