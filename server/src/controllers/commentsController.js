const Comment = require("../models/comment");

const createComment = async (req, res) => {
  try {
    const { name, comment, email, blogId } = req.body;

    if (!name || !comment || !email || !blogId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newComment = await Comment.create({ name, comment, email, blogId });

    res.status(201).json({ success: true, data: newComment });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
};

const getCommentsByBlogId = async (req, res) => {
  try {
    const { blogId } = req.params;

    const comments = await Comment.findAll({
      where: { blogId },
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, data: comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

module.exports = {
  createComment,
  getCommentsByBlogId,
};
