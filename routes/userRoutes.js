const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authenticateToken");

//controllers
const {
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
} = require("../controllers/userController");

router
  .get("/tenants", authenticateToken, getAllTenant)
  .post("/tenants/add", authenticateToken, addTenant)
  .get("/tenants/:id", authenticateToken, getSingleTenant);
router.post("/upload/:type", authenticateToken, upload);
router
  .get("/property-units", authenticateToken, getAllUnit)
  .post("/property-units/add", authenticateToken, addUnit)
  .patch("/property-units/update", authenticateToken, updateUnit);
router
  .get("/transactions", authenticateToken, getAllTransactions)
  .post("/transactions/add", authenticateToken, addTransaction)
  .get("/transactions/:id", authenticateToken, getTenantTransactions);

router.get("/users", authenticateToken, getAllUser);

module.exports = router;
