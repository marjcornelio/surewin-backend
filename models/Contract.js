const { Sequelize, DataTypes, Model } = require("sequelize");

const sequelize = require("../db/connect");

const Contract = sequelize.define("contract", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tenant_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "tenants",
      key: "id",
    },
  },
  stall: {
    type: DataTypes.STRING,
  },
  start_date: {
    type: DataTypes.DATE,
  },
  end_date: {
    type: DataTypes.DATE,
  },
  deposit: {
    type: DataTypes.INTEGER,
  },
  balance: {
    type: DataTypes.INTEGER,
  },
  rental_amount: {
    type: DataTypes.INTEGER,
  },
  rental_frequency: {
    type: DataTypes.ENUM,
    values: ["Monthly", "Daily"],
  },
});

Contract.associate = (models) => {
  Contract.belongsTo(models.Tenant, { foreignKey: { allowNull: false } });
};

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Table created successfully!");
  })
  .catch((error) => {
    console.error("Unable to create table : ");
  });

module.exports = Contract;