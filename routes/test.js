const express = require("express");
const router = express.Router();
const { hello } = require("../controllers/test");

router.get("/test", hello);
module.exports = router;
