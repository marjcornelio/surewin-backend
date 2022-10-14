const { Sequelize } = require("sequelize");

const connectDB = new Sequelize("test", "root", "admin", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = connectDB;
