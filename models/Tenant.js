const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("../db/connect");
const Contract = require("./Contract");

const Tenant = sequelize.define("tenant", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false,
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
  email: {
    type: DataTypes.STRING,
  },
  image: {
    type: DataTypes.STRING,
  },
  contact_number: {
    type: DataTypes.STRING,
  },
});

Tenant.associate = (models) => {
  Tenant.hasMany(models.Contract, { onDelete: "Cascade" });
  Tenant.hasMany(models.Transaction, { onDelete: "Cascade" });
};
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Table created successfully!");
  })
  .catch((error) => {
    console.error("Unable to create table : ");
  });

module.exports = Tenant;
