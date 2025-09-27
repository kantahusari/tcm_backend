const express = require("express");
const router = express.Router();
const { verifyToken } = require("../controllers/authController");
const { get_days, update_days, get_messages, get_unread_messages, open_message, deletemessage, get_categories, delete_category, add_category, getAllFiles, getFcount, deleteFile, hidefile } = require("../controllers/adminController");

// Middleware to verify token for all admin routes
router.use(verifyToken);

router.get("/days", get_days);
router.put("/days", update_days);

router.post("/getmessages", get_messages);
router.get("/unread", get_unread_messages);
router.post("/openmessage", open_message);
router.post("/deletemessage", deletemessage);

router.post("/categories", add_category);
router.get("/categories", get_categories);
router.post("/delete_cat", delete_category);

router.get("/all", getAllFiles);
router.get("/fcount", getFcount);
router.post("/delete", deleteFile);
router.post("/hide", hidefile);

// Add more protected admin routes here

module.exports = router;
