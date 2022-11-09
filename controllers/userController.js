const User = require("../models/User");
const Tenant = require("../models/Tenant");
const Contract = require("../models/Contract");
const Unit = require("../models/PropertyUnit");
const Transaction = require("../models/Transaction");
const Invoice = require("../models/Invoice");
const ParkingCollection = require("../models/ParkingCollection");
const Utility = require("../models/Utility");
const sequelize = require("../db/connect");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const multer = require("multer");
const fs = require("fs");
const { Op } = require("sequelize");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
    clientId: process.env.OAUTH_CLIENTID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFFRESH_TOKEN,
  },
});

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
const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ where: { id: id } });
    res.status(200).json({ success: true, user: user });
  } catch (error) {
    res.json({ success: false, msg: "Something Went Wrong" });
  }
};
const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstname,
      lastname,
      street_address,
      province,
      city,
      barangay,
      zip,
      email,
      avatar,
      contact_number,
      user_role,
    } = req.body;
    await User.update(
      {
        firstname: firstname,
        lastname: lastname,
        street_address: street_address,
        province: province,
        city: city,
        barangay: barangay,
        zip: zip,
        email: email,
        image: avatar,
        contact_number: contact_number,
        user_role: user_role,
      },
      { where: { id: id } }
    );
    res.status(200).json({ success: true, msg: "Successfully Edited" });
  } catch (error) {
    res.json({ success: false, msg: "Something Went Wrong" });
  }
};
const addUser = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      street_address,
      province,
      city,
      barangay,
      zip,
      email,
      avatar,
      contact_number,
      user_role,
    } = req.body;
    await User.create({
      firstname: firstname,
      lastname: lastname,
      street_address: street_address,
      province: province,
      city: city,
      barangay: barangay,
      zip: zip,
      email: email,
      image: avatar,
      contact_number: contact_number,
      user_role: user_role,
    });
    res.status(201).json({ success: true, msg: "Successfully Created" });
  } catch (error) {
    res.json({ success: false, msg: "Something Went Wrong" });
    console.log(error);
  }
};
const getAllTenant = async (req, res) => {
  try {
    const [results, metadata] = await sequelize.query(
      "SELECT * FROM contracts LEFT OUTER JOIN tenants ON contracts.tenant_id = tenants.id"
    );
    const tenants = results;
    tenants.map((i) => delete i.password && delete i.username);

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
    let unit = [];
    if (contract !== null) {
      const stall = contract.stall.split(",");
      if (stall.length > 0) {
        stall.map(async (s) => {
          const temp = await Unit.findOne({ where: { unit_title: s } });
          unit.push(temp);
        });
      } else {
        const temp = await Unit.findOne({ where: { unit_title: s } });
        unit.push(temp);
      }
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
      validId,
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
      electric_meter,
      electric_initial_reading,
      water_meter,
      water_initial_reading,
    } = req.body;
    let password = "";
    let hashedPassword = "";
    if (email) {
      var chars =
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      var passwordLength = 10;
      for (var i = 0; i <= passwordLength; i++) {
        var randomNumber = Math.floor(Math.random() * chars.length);
        password += chars.substring(randomNumber, randomNumber + 1);
      }
      const salt = await bcrypt.genSalt();
      hashedPassword = await bcrypt.hash(password, salt);
    }
    console.log(password, hashedPassword);

    const tenants = await Tenant.create({
      firstname: firstname,
      lastname: lastname,
      street_address: street_address,
      province: province,
      city: city,
      barangay: barangay,
      zip: zip,
      image: avatar,
      valid_id: validId,
      contact_number: mobile,
      email: email,
      password: hashedPassword,
      user_role: "tenant",
    });
    const contract = await Contract.create({
      tenant_id: tenants.dataValues.id,
      deposit: deposit,
      stall: stall.join(),
      rental_amount: rent,
      rental_frequency: frequency,
      electric: electric,
      water: water,
      internet: internet,
      start_date: startdate,
      end_date: enddate,
      status: "Active",
      electric_meter: electric_meter,
      electric_initial_reading: electric_initial_reading,
      electric_last_reading: new Date(),
      water_meter: water_meter,
      water_initial_reading: water_initial_reading,
      electric_last_reading: new Date(),
    });
    stall.map((s) => {
      Unit.update({ status: unit_status }, { where: { unit_title: s } });
    });

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
    // let info = await transporter.sendMail({
    //   from: '"Fred Foo 👻" <foo@example.com>', // sender address
    //   to: `${email}`, // list of receivers
    //   subject: "Hello ✔", // Subject line
    //   text: "Hello world?", // plain text body
    //   html: "<b>Hello world?</b>", // html body
    // });

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
      electric_meter,
      water_meter,
      electric_initial_reading,
      water_initial_reading,
    } = req.body;
    const contract = await Contract.update(
      {
        stall: stall.join(),
        rental_amount: rental_amount,
        start_date: startdate,
        end_date: enddate,
        rental_frequency: rental_frequency,
        electric: electric,
        water: water,
        internet: internet,
        status: status,
        electric_meter: electric_meter,
        water_meter: water_meter,
        electric_initial_reading: electric_initial_reading,
        water_initial_reading: water_initial_reading,
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
    console.log(error);
    res.status(400).json({ success: false, msg: "Something Went Wrong" });
  }
};

const setElectricBill = async (req, res) => {
  try {
    const { tenant_id, electric_initial_reading, electric_last_reading, cost } =
      req.body;
    await Contract.update(
      {
        electric_initial_reading: electric_initial_reading,
        electric_last_reading: electric_last_reading,
      },
      { where: { tenant_id: tenant_id } }
    );
    const invoice = await Invoice.create({
      amount_to_paid: cost,
      tenant_id: tenant_id,
      status: "Unpaid",
      payment_for: "Electricity Bill",
      due_date: new Date(),
      description: "",
      received: 0,
      balance: cost,
    });
    res
      .status(201)
      .json({ success: true, msg: "Successfully Place Electricity Bill" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, msg: "Something Went Wrong" });
  }
};
const setWaterBill = async (req, res) => {
  try {
    const { tenant_id, water_initial_reading, water_last_reading, cost } =
      req.body;
    await Contract.update(
      {
        water_initial_reading: water_initial_reading,
        water_last_reading: water_last_reading,
      },
      { where: { tenant_id: tenant_id } }
    );
    const invoice = await Invoice.create({
      amount_to_paid: cost,
      tenant_id: tenant_id,
      status: "Unpaid",
      payment_for: "Water Bill",
      due_date: new Date(),
      description: "",
      received: 0,
      balance: cost,
    });
    res
      .status(201)
      .json({ success: true, msg: "Successfully Place Water Bill" });
  } catch (error) {
    console.log(error);
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
      description,
      status,
      rental_amount,
    } = req.body;
    const unit = await Unit.create({
      type: type,
      unit_title: unit_title,
      floorArea: floorArea,
      rental_amount: rental_amount,
      manager: manager,
      image: image,
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
    } = req.body;
    const invoice = await Invoice.create({
      amount_to_paid: amount_to_paid,
      tenant_id: tenant_id,
      status: status,
      payment_for: payment_for,
      due_date: due_date,
      description: description,
      received: received,
      balance: amount_to_paid - received,
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

    if (Array.isArray(invoice)) {
      await Invoice.findAll({ where: { tenant_id: tenant_id } })
        .then((data) => data.filter((d) => invoice.some((i) => i.id === d.id)))
        .then((data) => {
          data.map(async (d) => {
            await Invoice.update(
              {
                received: d.amount_to_paid,
                balance: 0,
                status: "Paid",
              },
              { where: { id: d.id } }
            );
          });
        });
    } else {
      const getInvoice = await Invoice.findOne({ where: { id: invoice } });
      await Invoice.update(
        {
          received: getInvoice.received + amount,
          balance: getInvoice.balance - amount,
          status:
            getInvoice.received + amount < getInvoice.amount_to_paid
              ? "Partial"
              : "Paid",
        },
        { where: { id: invoice } }
      );
    }
    await Transaction.create({
      tenant_id: tenant_id,
      invoice_id: Array.isArray(invoice)
        ? invoice.map((i) => i.id).join()
        : invoice,
      received_amount: amount,
      payment_date: Date.now(),
      description: description,
      payment_method: payment_method,
    });
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
    const users = await User.findAll({
      attributes: { exclude: ["password", "username"] },
    });

    res.status(200).json({
      success: true,
      parkingCollections: parkingCollections,
      users: users,
    });
  } catch (error) {
    res.json({ success: false, msg: "Something Went Wrong" });
  }
};
const addParkingCollection = async (req, res) => {
  try {
    const { received_from, received_amount, date, description } = req.body;

    await ParkingCollection.create({
      received_from: received_from,
      received_amount: received_amount,
      payment_date: date,
      description: description,
    });

    res.status(201).json({
      success: true,
      msg: "Successfully Added Parkign Collection",
    });
  } catch (error) {
    res.status(400).json({ success: false, msg: "Something Went Wrong" });
  }
};

const getUtility = async (req, res) => {
  try {
    const utility = await Utility.findAll();
    res.status(200).json({
      success: true,
      utility: utility,
    });
  } catch (error) {
    res.json({ success: false, msg: "Something Went Wrong" });
  }
};
const editUtility = async (req, res) => {
  try {
    const { electricity_rate, water_rate, id } = req.body;
    await Utility.update(
      {
        electricity_rate: electricity_rate,
        water_rate: water_rate,
      },
      { where: { id: id } }
    );
    res.status(201).json({ success: true, msg: "Successfully Edited" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, msg: "Something Went Wrong" });
  }
};

module.exports = {
  getAllUser,
  getSingleUser,
  addUser,
  editUser,
  getAllTenant,
  getSingleTenant,
  addTenant,
  editTenant,
  setElectricBill,
  setWaterBill,
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
  addParkingCollection,
  getUtility,
  editUtility,
};
