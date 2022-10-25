const { Sequelize, DataTypes, Model } = require("sequelize");

const sequelize = require("../db/connect");

const Transaction = sequelize.define("transaction", {
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
  amount: {
    type: DataTypes.INTEGER,
  },
  received: {
    type: DataTypes.INTEGER,
  },
  balance: {
    type: DataTypes.INTEGER,
  },
  payment_for: {
    type: DataTypes.STRING,
  },
  payment_method: {
    type: DataTypes.ENUM,
    values: ["Cash", "Online"],
  },
  payment_date: {
    type: DataTypes.DATE,
  },
  status: {
    type: DataTypes.ENUM,
    values: ["Paid", "Unpaid", "Partial"],
  },
  description: {
    type: DataTypes.STRING,
  },
});

Transaction.associate = (models) => {
  Transaction.belongsTo(models.Tenant, { foreignKey: { allowNull: false } });
};

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Table created successfully!");
  })
  .catch((error) => {
    console.error("Unable to create table : ");
  });

module.exports = Transaction;
