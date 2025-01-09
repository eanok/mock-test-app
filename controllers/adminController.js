const connection = require("../db");
const fs = require("fs");
const csvParser = require("csv-parser");
const express = require("express");
const { rejects } = require("assert");
const { stringify } = require("querystring");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Display login page.
const loginPage = (req, res) => {
  res.render("adminLogin");
};

// Verify the login details
const loginVerification = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    console.log("Username and Password are required.");
    return res
      .status(400)
      .json({ error: "Username and Password are required." });
  }

  connection
    .query("SELECT * FROM admin_login WHERE username = ?", [username])
    .then(([rows]) => {
      if (rows.length === 0) {
        console.log("Invalid username.");
        return res.status(401).json({ error: "Invalid username or password." });
      }

      const user = rows[0];

      if (user.password === password) {
        console.log("Login successful.");
        res.redirect("/admin-dashboard");
        // res.render("dashboard", { username: user.username });
      } else {
        console.log("Invalid password.");
        res.status(401).json({ error: "Invalid username or password." });
      }
    })
    .catch((error) => {
      console.error(`Error querying database: ${error.message}`);
      res.status(500).json({ error: "Internal server error." });
    });
};

// store data into mysql databse
const addTest = async (req, res) => {
  const {
    testTitle,
    testCategory,
    timeLimit,
    totalQuestions,
    testDescription,
  } = req.body;
  const filePath = req.file?.path;

  console.log(
    testTitle,
    testCategory,
    timeLimit,
    totalQuestions,
    testDescription
  );
  // res.send({
  //   testTitle,
  //   testCategory,
  //   timeLimit,
  //   totalQuestions,
  //   testDescription,
  // });

  if (
    !testTitle ||
    !testCategory ||
    !timeLimit ||
    !totalQuestions ||
    !testDescription ||
    !filePath
  ) {
    return res.status(400).send("Inster title and upload csv file properly");
  }

  const csvData = [];

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => {
          csvData.push(row);
        })
        .on("end", resolve)
        .on("error", reject);
    });
    if (!csvData.length) {
      return res.status(400).send("No data in csv file.");
    }

    console.log("CSV data parsed successfully:", csvData);
    // return res.status(200).send("Successfully csv data is store and logged");

    const sqlQuery =
      "INSERT INTO tests (title, category, time_limit, no_questions, description) VALUE (?, ?, ?, ?,?)";
    const [result] = await connection
      .query(sqlQuery, [
        testTitle,
        testCategory,
        timeLimit,
        totalQuestions,
        testDescription,
      ])
      .catch((err) => {
        console.log("Error upload title into db:", err);
      });

    const testId = result.insertId;
    console.log("test id:", testId);

    const questionsPromise = csvData.map((test) => {
      const options = JSON.stringify({
        option1: test.option1,
        option2: test.option2,
        option3: test.option3,
        option4: test.option4,
      });
      return connection.query(
        "INSERT INTO question (test_id, questions, options, answer) VALUES (?, ?, ?, ?)",
        [testId, test.question, options, test.answer]
      );
    });
    await Promise.all(questionsPromise);
    console.log("All questions inserted successfully.");

    res.redirect(
      "/admin-dashboard?showAddTest=true&message=Test added successfully!"
    );
  } catch (err) {
    console.error("Error during CSV processing or database operations:", err);
    res.status(500).send(`Internal Server Error: ${err.message}`);
  }
};

// Display admin dashboard page
const adminDashboardPage = async (req, res) => {
  const sqlQuery = "SELECT * FROM tests ORDER BY id DESC";
  await connection
    .query(sqlQuery)
    .then(([rows]) => {
      const test_details = rows.map((data) => ({
        id: data.id,
        title: data.title,
        category: data.category,
        time_limit: data.time_limit,
        no_questions: data.no_questions,
        description: data.description,
      }));

      res.render("admin-dashboard", { test_details });
    })
    .catch((err) => {
      console.log(err);
    });
};

// . delete test.
const deleteTest = async (req, res) => {
  const testId = req.params.id;

  const sqlQuery = "DELETE FROM tests WHERE id = ?";
  await connection
    .query(sqlQuery, [testId])
    .then(
      res.status(200).json({
        success: true,
        message: `Test with ID ${testId} deleted successfully.`,
      })
    )
    .catch((err) => {
      res
        .status(500)
        .json({ success: false, message: "Error deleting the test." });
      console.log(err);
    });
};

module.exports = {
  loginPage,
  loginVerification,
  adminDashboardPage,
  addTest,
  deleteTest,
};
