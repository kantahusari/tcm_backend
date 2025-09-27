const express = require("express");
const router = express.Router();
const { add_message, working_hours, get_guest_images } = require("../controllers/guestController");

router.post("/contact", add_message);
router.get("/working_hours", working_hours);
router.get("/guest_images", get_guest_images);
module.exports = router;
