const express = require("express");
const exphbs = require("express-handlebars");

const multer = require("multer");

require("dotenv").config();

const app = express();
const connection = require("./db.js");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static("public")); // Static files (e.g., CSS)

// Database connection check
connection
  .getConnection()
  .then((conn) => {
    console.log("Database is connected successfully.");
    conn.release();
  })
  .catch((error) => {
    console.error(`Database Connection error: ${error.message}`);
    process.exit(1);
  });

// Handlebars templating engine setup
const handlebars = exphbs.create({ extname: ".hbs" });
app.engine("hbs", handlebars.engine);
app.set("view engine", "hbs");

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv") {
      cb(null, true);
    } else {
      cb(new Error("Only .CSV files can be uploaded."));
    }
  },
});

const {
  loginPage,
  loginVerification,
  adminDashboardPage,
  addTest,
  deleteTest,
} = require("./controllers/adminController.js");

// Routes

// 1. Admin Login Page
app.get("/login", loginPage);

// 2. Admin Login Verification
app.post("/login", loginVerification);

// 3. Admin Registration Page
app.get("/register-now", (req, res) => {
  res.render("register");
});

// 4. Dashboard Page
app.get("/admin-dashboard", adminDashboardPage);

// 6. Upload CSV File and Read Its Data
app.post("/add-test", upload.single("testQuestions"), addTest);

// 7. delete test.
app.delete("/delete-test/:id", deleteTest);

// Server Configuration
const port = process.env.PORT || 82;
app.listen(port, (err) => {
  if (err) {
    console.error(`Error occurred while starting server: ${err.message}`);
  } else {
    console.log(
      `Server running successfully at http://localhost:${port}/login`
    );
  }
});
