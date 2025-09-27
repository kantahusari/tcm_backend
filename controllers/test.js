const asyncHandler = require("express-async-handler");
const exe_query = require("../serviceworker/dbservice").exe_query;

const hello = asyncHandler(async (req, res) => {
  try {
    res.status(200).json({ message: "Hello, world!" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = {
  hello,
};
