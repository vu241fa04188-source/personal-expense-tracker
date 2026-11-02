const express = require('express');
const router = express.Router();
const {
  addTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getDashboardSummary,
  getMonthlyReports,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

// Protect all transaction routes with JWT authentication
router.use(protect);

// Dashboard and Report routes (placed before /:id)
router.get('/summary', getDashboardSummary);
router.get('/reports', getMonthlyReports);

// CRUD routes
router.route('/')
  .post(addTransaction)
  .get(getTransactions);

router.route('/:id')
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;

