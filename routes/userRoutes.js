const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authenticateToken");

//controllers
const {
  getAllUser,
  getAllTenant,
  getSingleTenant,
  addTenant,
  editTenant,
  deleteTenant,
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
  editContract,
  addContract,
  getUtility,
  editUtility,
} = require("../controllers/userController");

router
  .get("/tenants", authenticateToken, getAllTenant)
  .post("/tenants/add", authenticateToken, addTenant)
  .get("/tenants/:id", authenticateToken, getSingleTenant)
  .patch("/tenants/edit/:id", authenticateToken, editTenant)
  .delete("/tenants/delete/:id", authenticateToken, deleteTenant);
router.patch("/lease/edit/:id", authenticateToken, editContract);
router.post("/upload/:type", authenticateToken, upload);
router
  .get("/property-units", authenticateToken, getAllUnit)
  .post("/property-units/add", authenticateToken, addUnit)
  .patch("/property-units/update", authenticateToken, updateUnit);
router
  .get("/transactions", authenticateToken, getAllTransactions)
  .post("/transactions/add", authenticateToken, addTransaction)
  .get("/transactions/:id", authenticateToken, getTenantTransactions);
router
  .get("/invoices", authenticateToken, getAllInvoice)
  .post("/invoices/add", authenticateToken, addInvoice)
  .get("/invoices/:id", authenticateToken, getTenantInvoices);
router.get("/parking_collections", authenticateToken, getAllParkingCollections);
router
  .get("/utility", authenticateToken, getUtility)
  .patch("/utility", authenticateToken, editUtility);

router.get("/users", authenticateToken, getAllUser);

module.exports = router;
