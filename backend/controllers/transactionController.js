const Transaction = require('../models/Transaction');

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date, description } = req.body;

    // Basic validation
    if (!title || !amount || !type || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, amount, type, and category',
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either income or expense',
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount: Number(amount),
      type,
      category,
      date: date || Date.now(),
      description: description || '',
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get all transactions for logged in user (with search & filter)
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { search, type, category, startDate, endDate } = req.query;

    // Filter scoped to logged-in user
    let filter = { user: req.user._id };

    // Search by title
    if (search && search.trim() !== '') {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    // Filter by type
    if (type && type !== 'all') {
      filter.type = type;
    }

    // Filter by category
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // End of the day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const transactions = await Transaction.find(filter).sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Check user ownership
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this transaction' });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Get transaction by id error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Update an existing transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Check user ownership
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this transaction' });
    }

    const { title, amount, type, category, date, description } = req.body;

    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be income or expense' });
    }

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        title: title !== undefined ? title : transaction.title,
        amount: amount !== undefined ? Number(amount) : transaction.amount,
        type: type !== undefined ? type : transaction.type,
        category: category !== undefined ? category : transaction.category,
        date: date !== undefined ? date : transaction.date,
        description: description !== undefined ? description : transaction.description,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Check user ownership
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this transaction' });
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get dashboard summary (Totals, Charts Data, Recent Transactions)
// @route   GET /api/transactions/summary
// @access  Private
const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all user transactions
    const allTransactions = await Transaction.find({ user: userId }).sort({ date: -1 });

    // 1. Calculate Totals
    let totalIncome = 0;
    let totalExpense = 0;

    allTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else if (tx.type === 'expense') {
        totalExpense += tx.amount;
      }
    });

    const balance = totalIncome - totalExpense;

    // 2. Category-wise expense calculation
    const categoryMap = {};
    allTransactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
      });

    const categoryBreakdown = Object.keys(categoryMap).map((cat) => ({
      category: cat,
      amount: Number(categoryMap[cat].toFixed(2)),
    }));

    // 3. Monthly Income vs Expense breakdown (Group by YYYY-MM)
    const monthlyMap = {};
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    allTransactions.forEach((tx) => {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const displayLabel = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;

      if (!monthlyMap[key]) {
        monthlyMap[key] = { key, label: displayLabel, income: 0, expense: 0 };
      }

      if (tx.type === 'income') {
        monthlyMap[key].income += tx.amount;
      } else {
        monthlyMap[key].expense += tx.amount;
      }
    });

    // Sort chronologically and take last 6 months
    const monthlyBreakdown = Object.values(monthlyMap)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6);

    // 4. Recent transactions (5 most recent)
    const recentTransactions = allTransactions.slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        totalIncome: Number(totalIncome.toFixed(2)),
        totalExpense: Number(totalExpense.toFixed(2)),
        balance: Number(balance.toFixed(2)),
        categoryBreakdown,
        monthlyBreakdown,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// @desc    Get detailed monthly reports
// @route   GET /api/transactions/reports
// @access  Private
const getMonthlyReports = async (req, res) => {
  try {
    const userId = req.user._id;
    const { year } = req.query;

    const queryYear = year ? parseInt(year, 10) : new Date().getFullYear();

    const startOfYear = new Date(`${queryYear}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${queryYear}-12-31T23:59:59.999Z`);

    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: startOfYear, $lte: endOfYear },
    }).sort({ date: 1 });

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    // Initialize 12 months array
    const monthlyData = monthNames.map((name, index) => ({
      monthIndex: index,
      monthName: name,
      income: 0,
      expense: 0,
      savings: 0,
      transactionCount: 0,
    }));

    const categoryMap = {};

    transactions.forEach((tx) => {
      const txMonth = new Date(tx.date).getMonth();
      monthlyData[txMonth].transactionCount += 1;

      if (tx.type === 'income') {
        monthlyData[txMonth].income += tx.amount;
      } else {
        monthlyData[txMonth].expense += tx.amount;
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
      }
    });

    monthlyData.forEach((m) => {
      m.savings = m.income - m.expense;
      m.income = Number(m.income.toFixed(2));
      m.expense = Number(m.expense.toFixed(2));
      m.savings = Number(m.savings.toFixed(2));
    });

    const categoryTotals = Object.keys(categoryMap).map((cat) => ({
      category: cat,
      amount: Number(categoryMap[cat].toFixed(2)),
    }));

    res.status(200).json({
      success: true,
      data: {
        year: queryYear,
        monthlyData,
        categoryTotals,
        totalYearIncome: monthlyData.reduce((acc, m) => acc + m.income, 0),
        totalYearExpense: monthlyData.reduce((acc, m) => acc + m.expense, 0),
        totalYearSavings: monthlyData.reduce((acc, m) => acc + m.savings, 0),
      },
    });
  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getDashboardSummary,
  getMonthlyReports,
};

