const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const asyncHandler = require("express-async-handler");
const exe_query = require("../serviceworker/dbservice").exe_query;
const { verifyToken } = require("../controllers/authController");
// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "file_" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // const allowedTypes = /jpeg|jpg|png|webp|gif|pdf|doc|docx|txt/;
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Error: File type not allowed!"));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

const store_file_data = asyncHandler(async (req, res) => {
  const { originalname, destination, filename, mimetype } = req.file;
  const { category } = req.body;
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded or invalid file type",
      });
    }
    const check_query = await exe_query("SELECT * FROM pics WHERE originalname = ?", [originalname]);
    if (check_query.length > 0) {
      return res.status(400).json({ success: false, message: "this file was uploaded previously" });
    }
    const result = await exe_query("INSERT INTO pics (originalname, filename, filetype, category, filepath, is_displayed) VALUES (?,?,?,?,?,?)", [originalname, filename, mimetype, category, `${req.protocol}://${req.get("host")}/uploads/${filename}`, 1]);
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      const newExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
      await exe_query("UPDATE sessions SET expiresat = ? WHERE token = ?", [newExpiresAt.toISOString(), token]);
    }
    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = { upload, store_file_data };
