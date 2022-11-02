const User = require("../models/User");
const Tenant = require("../models/Tenant");
const Contract = require("../models/Contract");
const Unit = require("../models/PropertyUnit");
const Transaction = require("../models/Transaction");
const Invoice = require("../models/Invoice");
const ParkingCollection = require("../models/ParkingCollection");
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
      where: { tenant_id: tenant.id },
    });
    let unit = null;
    if (contract !== null) {
      unit = await Unit.findOne({ where: { id: contract.stall } });
    }
    const transactions = Transaction.findAll({
      where: { tenant_id: tenant.id },
    });
    const invoices = Invoice.findAll({
      where: { tenant_id: tenant.id },
    });
    console.log(invoices);
    res.status(200).json({
      success: true,
      data: {
        tenant: tenant,
        contract: contract ? contract : null,
        transactions: (await transactions) ? await transactions : null,
        unit: unit ? unit : null,
        invoices: (await invoices) ? await invoices : null,
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
      deposit_received,
      stall,
      rent,
      frequency,
      startdate,
      enddate,
      electric,
      water,
      internet,
      unit_status,
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
      password: "$2b$10$HxUGW1lXzB1KoqLe6onIsuIvcUtNMP4f9cKEaSkRTDisA1NkqdcHi",
      user_role: "tenant",
    });
    const contract = await Contract.create({
      tenant_id: tenants.dataValues.id,
      deposit: deposit,
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
    Unit.update({ status: unit_status }, { where: { id: stall } });
    if (deposit) {
      const invoice = Invoice.create({
        tenant_id: tenants.dataValues.id,
        payment_for: "Deposit",
        amount_to_paid: deposit,
        status:
          deposit === deposit_received
            ? "Paid"
            : deposit > deposit_received
            ? "Partial"
            : "Unpaid",
        due_date: Date.now(),
        description: "",
        received: deposit_received,
        balance: deposit - deposit_received,
      }).then((invoice) => {
        if (deposit_received) {
          Transaction.create({
            tenant_id: tenants.dataValues.id,
            invoice_id: invoice.dataValues.id,
            received_amount: deposit_received,
            payment_date: Date.now(),
            description: "",
            payment_method: "Cash",
          });
        }
      });
    }

    res.status(201).json({ success: true, msg: "Tenant Added Successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, msg: "Something Went Wrong" });
  }
};
const editTenant = async (req, res) => {
  try {
    const {
      id,
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
    } = req.body;

    const tenants = await Tenant.update(
      {
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
        password:
          "$2b$10$HxUGW1lXzB1KoqLe6onIsuIvcUtNMP4f9cKEaSkRTDisA1NkqdcHi",
        user_role: "tenant",
      },
      { where: { id: id } }
    );

    res.status(201).json({ success: true, msg: "Successfully Edited" });
  } catch (error) {
    res.status(400).json({ success: false, msg: "Something Went Wrong" });
  }
};

const deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = await Tenant.findOne({ where: { id: id } });
    const contract = await Contract.findOne({ where: { tenant_id: id } });

    if (tenant) {
      Transaction.destroy({ where: { tenant_id: id } }).then(() => {
        Invoice.destroy({ where: { tenant_id: id } }).then(() => {
          Unit.update({ status: "vacant" }, { where: { id: contract.stall } });
          Contract.destroy({ where: { tenant_id: id } }).then(() => {
            Tenant.destroy({ where: { id: id } });
          });
        });
      });

      return res
        .status(201)
        .json({ success: true, msg: "Successfully Deleted" });
    }

    return res.status(404).json({ success: true, msg: "Data Not Found" });
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
const editContract = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      stall,
      rental_amount,
      startdate,
      enddate,
      rental_frequency,
      electric,
      water,
      internet,
      status,
      unit,
    } = req.body;
    const contract = await Contract.update(
      {
        stall: stall,
        rental_amount: rental_amount,
        start_date: startdate,
        end_date: enddate,
        rental_frequency: rental_frequency,
        electric: electric,
        water: water,
        internet: internet,
        status: status,
      },
      { where: { id: id } }
    );
    if (status === "Ended") {
      await Unit.update(
        {
          status: "vacant",
        },
        { where: { id: unit.id } }
      );
    }
    res.status(201).json({ success: true, msg: "Successfully Edited" });
  } catch (error) {
    res.status(400).json({ success: false, msg: "Something Went Wrong" });
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

const getAllInvoice = async (req, res) => {
  try {
    const invoices = await Invoice.findAll();
    res.status(200).json({
      success: true,
      invoices: invoices,
    });
  } catch (error) {
    res.json({ success: false, msg: "Something Went Wrong" });
  }
};
const getTenantInvoices = async (req, res) => {
  try {
    const { id } = req.params;
    const invoices = await Invoice.findAll({
      where: {
        tenant_id: id,
      },
    });

    res.status(200).json({
      success: true,
      invoices: invoices,
    });
  } catch (error) {
    res.json({ success: false, msg: "Something Went Wrong" });
  }
};
const addInvoice = async (req, res) => {
  console.log(req.body);
  try {
    const {
      tenant_id,
      status,
      payment_for,
      amount_to_paid,
      due_date,
      description,
      received,
      balance,
    } = req.body;

    const invoice = await Invoice.create({
      tenant_id: tenant_id,
      status: status,
      payment_for: payment_for,
      amount_to_paid: amount_to_paid,
      due_date: due_date,
      description: description,
      received: received,
      balance: balance,
    });
    res.status(201).json({ success: true, msg: "Invoice Added Successfully" });
  } catch (error) {
    res.json({ success: false, msg: "Something Went Wrong" });
  }
};

const addTransaction = async (req, res) => {
  try {
    const { tenant_id, amount, description, invoice, payment_method } =
      req.body;
    await Transaction.create({
      tenant_id: tenant_id,
      invoice_id: invoice,
      received_amount: amount,
      payment_date: Date.now(),
      description: description,
      payment_method: payment_method,
    });
    const getInvoice = await Invoice.findOne({ where: { id: invoice } });

    await Invoice.update(
      {
        received: getInvoice.received + amount,
        status:
          getInvoice.received + amount < getInvoice.amount_to_paid
            ? "Partial"
            : "Paid",
      },
      { where: { id: invoice } }
    );

    res
      .status(201)
      .json({ success: true, msg: "Transaction Added Successfully" });
  } catch (error) {
    res.json({ success: false, msg: "Something Went Wrong" });
  }
};

const getAllParkingCollections = async (req, res) => {
  try {
    const parkingCollections = await ParkingCollection.findAll();

    res.status(200).json({
      success: true,
      parkingCollections: parkingCollections,
    });
  } catch (error) {
    res.json({ success: false, msg: "Something Went Wrong" });
  }
};

module.exports = {
  getAllUser,
  getAllTenant,
  getSingleTenant,
  addTenant,
  editTenant,
  deleteTenant,
  editContract,
  getAllUnit,
  addUnit,
  updateUnit,
  upload,
  getAllTransactions,
  getTenantTransactions,
  getAllInvoice,
  addInvoice,
  addTransaction,
  getTenantInvoices,
  getAllParkingCollections,
};
