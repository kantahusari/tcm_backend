const express = require("express");
const router = express.Router();

const { upload, store_file_data } = require("../controllers/fuController");
const { verifyToken } = require("../controllers/authController");
const exe_query = require("../serviceworker/dbservice").exe_query;

router.post("/upload", verifyToken, upload.single("file"), store_file_data);

module.exports = router;
