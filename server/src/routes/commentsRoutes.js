const express = require("express");
const router = express.Router();
const {
  createComment,
  getCommentsByBlogId,
} = require("../controllers/commentsController");

router.post("/create", createComment);
router.get("/byBlog/:blogId", getCommentsByBlogId);

module.exports = router;
