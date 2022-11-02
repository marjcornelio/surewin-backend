const { Sequelize, DataTypes, Model } = require("sequelize");

const sequelize = require("../db/connect");

const ParkingCollection = sequelize.define("parking_collection", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  received_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  received_amount: {
    type: DataTypes.INTEGER,
  },
  payment_date: {
    type: DataTypes.DATE,
  },
});

ParkingCollection.associate = (models) => {
  ParkingCollection.belongsTo(models.User, {
    foreignKey: { allowNull: false },
  });
};

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Table created successfully! ");
  })
  .catch((error) => {
    console.error("Unable to create table : ");
  });

module.exports = ParkingCollection;