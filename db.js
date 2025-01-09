const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql
  .createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
  })
  .promise();

// connection.getConnection((err) => {
//   if (err) {
//     console.log(`Error occured while Connecting DB: ${err}`);
//   } else {
//     console.log("Database Connected Successfully.");
//   }
// });

module.exports = connection;
