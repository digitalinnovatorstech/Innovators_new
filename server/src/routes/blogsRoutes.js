const express = require("express");
const blogController = require("../controllers/blogsController");
const router = express.Router();

router.post("/createBlog", blogController.createBlog);
router.get("/getAllBlogs", blogController.getAllBlogs);
router.get("/getBlog/:id", blogController.getBlogById);
router.put("/updateBlog/:id", blogController.updateBlog);
router.delete("/deleteBlog/:id", blogController.deleteBlog);
router.get("/search", blogController.searchBlogs);

module.exports = router;