const User = require("../models/User");
const Tenant = require("../models/Tenant");
const Contract = require("../models/Contract");
const Unit = require("../models/PropertyUnit");
const Transaction = require("../models/Transaction");
const sequelize = require("../db/connect");

const multer = require("multer");
const fs = require("fs");
const { Op } = require("sequelize");

const uploadFnct = function (dest) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/" + dest + "/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  const upload = multer({ storage: storage }).single("file");
  return upload;
};

const getAllUser = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json({ success: true, users: users });
  } catch (error) {
    res.json({ success: false, msg: "Something Went Wrong" });
  }
};
const getAllTenant = async (req, res) => {
  try {
    const [results, metadata] = await sequelize.query(
      "SELECT * FROM contracts LEFT OUTER JOIN tenants ON contracts.tenant_id = tenants.id"
    );
    const tenants = results;
    res.status(200).json({ success: true, tenants: tenants });
  } catch (error) {
    res.json({ success: false, msg: "Something Went Wrong" });
  }
};

const getSingleTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ where: { id: req.params.id } });
    const contract = await Contract.findOne({
      where: { tenant_id: tenant.id, status: "Active" },
    });
    let unit = null;
    if (contract !== null) {
      unit = await Unit.findOne({ where: { id: contract.stall } });
    }
    const transactions = Transaction.findAll({
      where: { tenant_id: tenant.id },
    });
    res.status(200).json({
      success: true,
      data: {
        tenant: tenant,
        contract: contract ? contract : null,
        transactions: (await transactions) ? await transactions : null,
        unit: unit ? unit : null,
      },
    });
  } catch (error) {
    res.json({ success: false, msg: "Something Went Wrong" });
  }
};

const addTenant = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      street_address,
      province,
      city,
      barangay,
      zip,
      avatar,
      mobile,
      email,

      deposit,
      stall,
      rent,
      frequency,
      startdate,
      enddate,
      electric,
      water,
      internet,
      unit_status,
      unit_id,
    } = req.body;

    const tenants = await Tenant.create({
      firstname: firstname,
      lastname: lastname,
      street_address: street_address,
      province: province,
      city: city,
      barangay: barangay,
      zip: zip,
      image: avatar,
      contact_number: mobile,
      email: email,
    });
    const contract = await Contract.create({
      tenant_id: tenants.dataValues.id,
      deposit: deposit,
      balance: 1212,
      stall: stall,
      rental_amount: rent,
      rental_frequency: frequency,
      electric: electric,
      water: water,
      internet: internet,
      start_date: startdate,
      end_date: enddate,
      status: "Active",
    });
    Unit.update({ status: unit_status }, { where: { id: unit_id } });
    if (deposit) {
      Transaction.create({
        tenant_id: tenants.dataValues.id,
        status: "Paid",
        payment_for: "Deposit",
        amount: deposit,
        payment_method: "Cash",
        payment_date: Date.now(),
        received: deposit,
        balance: 0,
      });
    }

    res.status(201).json({ success: true, msg: "Tenant Added Successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, msg: "Something Went Wrong" });
  }
};
const upload = async (req, res) => {
  try {
    console.log(req.params.type);
    const currUpload = uploadFnct(req.params.type);
    currUpload(req, res, (err) => {
      if (err) {
        res.send(err);
      }
      return;
    });
  } catch (error) {
    res.json({ success: false, msg: "Something Went Wrong" });
  }
};

const getAllUnit = async (req, res) => {
  try {
    const units = await Unit.findAll();
    res.status(200).json({ success: true, units: units });
  } catch (error) {
    res.json({ success: false, msg: "Something Went Wrong" });
  }
};

const addUnit = async (req, res) => {
  try {
    const {
      type,
      unit_title,
      floorArea,
      manager,
      image,
      street_address,
      province,
      city,
      description,
      status,
    } = req.body;
    const unit = await Unit.create({
      type: type,
      unit_title: unit_title,
      floorArea: floorArea,
      manager: manager,
      image: image,
      street_address: street_address,
      province: province,
      city: city,
      description: description,
      status: status,
    });

    res
      .status(201)
      .json({ success: true, msg: "Property Unit Added Successfully" });
  } catch (error) {
    res.json({ success: false, msg: "Something Went Wrong" });
  }
};

const updateUnit = async (req, res) => {
  Unit.update({ status });
};

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll();
    console.log(transactions);
    res.status(200).json({
      success: true,
      transactions: transactions,
    });
  } catch (error) {
    res.json({ success: false, msg: "Something Went Wrong" });
  }
};
const getTenantTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    const { start, end } = req.body;
    const transactions = await Transaction.findAll({
      where: {
        tenant_id: id,
      },
    });

    res.status(200).json({
      success: true,
      transactions: transactions,
    });
  } catch (error) {
    res.json({ success: false, msg: "Something Went Wrong" });
  }
};

const addTransaction = async (req, res) => {
  console.log(req.body);
  try {
    const {
      tenant_id,
      status,
      payment_for,
      amount,
      method,
      date,
      description,
      received,
      balance,
    } = req.body;

    const transaction = await Transaction.create({
      tenant_id: tenant_id,
      status: status,
      payment_for: payment_for,
      amount: amount,
      payment_method: method,
      payment_date: date,
      description: description,
      received: received,
      balance: balance,
    });
    res
      .status(201)
      .json({ success: true, msg: "Transaction Added Successfully" });
  } catch (error) {
    res.json({ success: false, msg: "Something Went Wrong" });
  }
};

module.exports = {
  getAllUser,
  getAllTenant,
  getSingleTenant,
  addTenant,
  getAllUnit,
  addUnit,
  updateUnit,
  upload,
  getAllTransactions,
  getTenantTransactions,
  addTransaction,
};
