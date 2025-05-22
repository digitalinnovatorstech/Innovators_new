const Tag = require("../models/tags");

const createTag = async (req, res) => {
  try {
    const { name } = req.body;
    const newTag = await Tag.create({ name });
    res.status(201).json(newTag);
  } catch (error) {
    res.status(500).json({ error: "Error creating tag" });
  }
};

const getTags = async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: tags } = await Tag.findAndCountAll({
      limit,
      offset,
    });

    res.json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: tags,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching tags" });
  }
};

const getTagById = async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) return res.status(404).json({ error: "Tag not found" });
    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: "Error fetching tag" });
  }
};

const updateTag = async (req, res) => {
  try {
    const { name } = req.body;
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) return res.status(404).json({ error: "Tag not found" });
    await tag.update({ name });
    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: "Error updating tag" });
  }
};

const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) return res.status(404).json({ error: "Tag not found" });
    await tag.destroy();
    res.json({ message: "Tag deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting tag" });
  }
};

module.exports = { createTag, getTags, getTagById, updateTag, deleteTag };
