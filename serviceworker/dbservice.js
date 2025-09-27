const asyncHandler = require("express-async-handler");
const mysql = require("mysql");
const sqlOptions = require("../utility/utility");

function endConnection(connection) {
  connection.end((err) => {
    if (err) {
      console.error("Error ending the connection:", err);
    } else {
      // console.log("Connection ended successfully.");
    }
  });
}

const exe_query = asyncHandler(async (query, params = []) => {
  var value;
  var connect = mysql.createConnection(sqlOptions);
  return new Promise((resolve, reject) => {
    connect.query(query, params, function (error, results, fields) {
      if (error) {
        endConnection(connect);
        reject(error);
      } else {
        value = results;
        endConnection(connect);
        resolve(value);
      }
    });
  });
});

module.exports = { exe_query };
