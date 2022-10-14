require("dotenv").config();

const express = require("express");
const app = express();
app.use(express.json());
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//connect to Database
const connectDB = require("./db/connect");

//router
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");

app.get("/", (req, res) => {
  res.send("Hello  shit");
});

app.use("/api/auth", authRouter);
app.use("/api/", userRouter);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB.authenticate();
    app.listen(port, console.log("successfully connected to Database"));
  } catch (error) {
    console.log("Something Went Wrong, Please Try Again Later");
  }
};

start();
