const { Sequelize, DataTypes, Model } = require("sequelize");

const sequelize = require("../db/connect");

const Unit = sequelize.define("unit", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  unit_title: {
    type: DataTypes.STRING,
  },
  property_type: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.STRING,
  },
  floor_area: {
    type: DataTypes.INTEGER,
  },
  street_address: {
    type: DataTypes.STRING,
  },
  province: {
    type: DataTypes.STRING,
  },
  city: {
    type: DataTypes.STRING,
  },
  barangay: {
    type: DataTypes.STRING,
  },
  zip: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM,
    values: ["vacancy", "occupied", "unavailable"],
  },
});

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Table created successfully!");
  })
  .catch((error) => {
    console.error("Unable to create table: ");
  });

module.exports = Unit;
