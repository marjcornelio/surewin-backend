const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  const user = await User.findOne({
    where: {
      email: req.body.email,
    },
  });
  if (user == null) {
    return res.status(400).json({
      success: false,
      msg: "Incorrent email or password",
    });
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const email = user.email;
      const accessToken = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
      const { firstname, lastname, middlename, user_role } = user;
      return res.status(200).json({
        success: true,
        accessToken: accessToken,
        user: {
          firstname: firstname,
          lastname: lastname,
          middlename: middlename,
          user_role: user_role,
        },
      });
    } else {
      return res
        .status(400)
        .json({ success: false, msg: "Incorrent email or password" });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: "Something went wrong, Please Try again Later",
    });
  }
};

const register = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      middlename,
      address,
      user_role,
      image,
      contact_number,
      email,
      username,
      password,
    } = req.body;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      firstname: firstname,
      lastname: lastname,
      middlename: middlename,
      address: address,
      user_role: user_role,
      image: image,
      contact_number: contact_number,
      email: email,
      username: username,
      password: hashedPassword,
    });
    res.status(201).send();
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = { login, register };
