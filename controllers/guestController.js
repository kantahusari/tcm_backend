const asyncHandler = require("express-async-handler");
const exe_query = require("../serviceworker/dbservice").exe_query;

const add_message = asyncHandler(async (req, res) => {
  try {
    const { name, email, subject, mcontent } = req.body;

    const result = await exe_query("INSERT INTO messages (name, email, subject, mcontent, is_read) VALUES (?, ?, ?, ?, 0)", [name, email, subject, mcontent]);

    res.status(201).json({
      message: "Message created successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

const working_hours = asyncHandler(async (req, res) => {
  try {
    const result = await exe_query("SELECT * FROM work_hours");
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching work hours:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const get_guest_images = asyncHandler(async (req, res) => {
  try {
    const result = await exe_query("SELECT * FROM pics WHERE is_displayed = 1");
    const unique_cats = [...new Set(result.map((item) => item.category))];
    res.status(200).json({ images: result, categories: unique_cats });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = {
  add_message,
  working_hours,
  get_guest_images,
};
