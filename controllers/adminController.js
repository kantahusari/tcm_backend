const asyncHandler = require("express-async-handler");
const exe_query = require("../serviceworker/dbservice").exe_query;
const path = require("path");
const fs = require("fs");
const fsSync = require("fs").promises;

// days ------------------------
const get_days = asyncHandler(async (req, res) => {
  try {
    const days = await exe_query("SELECT * FROM work_hours");
    res.status(200).json(days);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
const update_days = asyncHandler(async (req, res) => {
  const body = req.body;
  try {
    const { index, field, value } = body;
    await exe_query(`UPDATE work_hours SET ${field} = ? WHERE id = ?`, [value, index]);
    const days = await exe_query("SELECT * FROM work_hours");
    res.status(200).json(days);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// messages ------------------------
const get_messages = asyncHandler(async (req, res) => {
  const { limit, offSet } = req.body;
  try {
    const messages = await exe_query("SELECT * FROM messages ORDER BY id DESC LIMIT ? OFFSET ?", [limit, offSet]);
    const count = await exe_query("SELECT COUNT(*) as count FROM messages");
    const [count_unread] = await exe_query("SELECT COUNT(*) as count FROM messages WHERE is_read = 0");
    const total_pages = count[0].count;
    const pages = Math.ceil(total_pages / limit);
    res.status(200).json({ messages, total: total_pages, pages, unread: count_unread.count });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
const get_unread_messages = asyncHandler(async (req, res) => {
  try {
    const [count_unread] = await exe_query("SELECT COUNT(*) as count FROM messages WHERE is_read = 0");
    res.status(200).json({ unread: count_unread.count });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

const open_message = asyncHandler(async (req, res) => {
  const { id } = req.body;
  try {
    await exe_query("UPDATE messages SET is_read = 1 WHERE id = ?", [id]);
    res.status(200).json({ message: "Message marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
const deletemessage = asyncHandler(async (req, res) => {
  const { id } = req.body;
  try {
    await exe_query("DELETE FROM messages WHERE id = ?", [id]);
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// categories ------------------------
const get_categories = asyncHandler(async (req, res) => {
  try {
    const categories = await exe_query("SELECT * FROM pic_categories");
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
const delete_category = asyncHandler(async (req, res) => {
  const { id } = req.body;
  try {
    const [category] = await exe_query("SELECT * FROM pic_categories WHERE id = ?", [id]);
    await exe_query("DELETE FROM pic_categories WHERE id = ?", [id]);
    await exe_query("DELETE FROM pics WHERE category = ?", [category.category]);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
const add_category = asyncHandler(async (req, res) => {
  try {
    const { category } = req.body;
    const result = await exe_query("INSERT INTO pic_categories (category) VALUES (?)", [category]);
    res.status(201).json({ message: "Category added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Images ------------------------
const getAllFiles = asyncHandler(async (req, res) => {
  try {
    const files = await exe_query("SELECT * FROM pics");
    res.status(200).json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
const getFcount = asyncHandler(async (req, res) => {
  try {
    const [count] = await exe_query("SELECT COUNT(*) as count FROM pics");
    res.status(200).json({ imagecount: count.count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const deleteFile = asyncHandler(async (req, res) => {
  const { id } = req.body;
  try {
    const [file] = await exe_query("SELECT * FROM pics WHERE id = ?", [id]);
    if (!file) {
      return res.status(404).json({ success: false, message: "File not found" });
    }
    const filePath = path.join(__dirname, "../uploads/", file.filename);
    const result = await exe_query("DELETE FROM pics WHERE id = ?", [id]);
    fsSync
      .unlink(filePath)
      .then(() => {
        res.status(200).json({ success: true, message: `File with id ${id} deleted successfully (not really, this is a placeholder)` });
      })
      .catch((err) => {
        return res.status(500).json({ success: false, message: "Unable to delete file" });
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const hidefile = asyncHandler(async (req, res) => {
  const { id, value } = req.body;
  try {
    const [file] = await exe_query("SELECT * FROM pics WHERE id = ?", [id]);
    if (!file) {
      return res.status(404).json({ success: false, message: "File not found" });
    }
    const result = await exe_query("UPDATE pics SET is_displayed = ? WHERE id = ?", [value === false ? 0 : 1, id]);
    res.status(200).json({ success: true, message: `File with id ${id} updated successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = {
  get_days,
  update_days,
  get_messages,
  get_unread_messages,
  open_message,
  deletemessage,
  get_categories,
  delete_category,
  add_category,
  getAllFiles,
  getFcount,
  deleteFile,
  hidefile,
};
