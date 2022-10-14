const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authenticateToken");

//controllers
const {
  getAllUser,
  getAllTenant,
  addTenant,
  getAllUnit,
  addUnit,
  uploadAvatar,
} = require("../controllers/userController");

router
  .get("/tenants", authenticateToken, getAllTenant)
  .post("/tenants/add", authenticateToken, addTenant);
router.post("/upload", authenticateToken, uploadAvatar);
router
  .get("/units", authenticateToken, getAllUnit)
  .post("/units/add", authenticateToken, addUnit);

module.exports = router;
