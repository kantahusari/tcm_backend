require("dotenv").config();
const sqlOptions = {
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.DBPWD,
  database: process.env.DB,
  port: process.env.DBPORT,
  charset: "utf8mb4_general_ci",
};

module.exports = sqlOptions;
