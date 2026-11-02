import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  Edit2,
  Trash2,
  Calendar,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import api from '../api/axios';

const CATEGORIES = [
  'All',
  'Salary',
  'Freelance',
  'Allowance',
  'Investments',
  'Gifts',
  'Other Income',
  'Food & Dining',
  'Housing & Rent',
  'Education & College',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Utilities & Bills',
  'Shopping',
  'Personal Care',
  'Other Expense',
];

const TransactionList = ({ onOpenAddModal }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (type !== 'all') params.type = type;
      if (category !== 'All') params.category = category;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/transactions', { params });
      if (res.data.success) {
        setTransactions(res.data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [type, category, startDate, endDate]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setType('all');
    setCategory('All');
    setStartDate('');
    setEndDate('');
  };

  // Delete Transaction
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`);
        fetchTransactions();
      } catch (err) {
        alert('Failed to delete transaction.');
      }
    }
  };

  // Calculate totals of currently filtered transactions
  const filteredIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const filteredExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="page-wrapper">
      <div className="section-header">
        <div>
          <h2>Transaction History</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Search, filter, edit and track all your personal financial records
          </p>
        </div>
        <button className="btn-primary" onClick={() => onOpenAddModal(null)}>
          <PlusCircle size={18} />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <form onSubmit={handleSearchSubmit} className="search-box">
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              style={{ background: 'none' }}
              onClick={() => {
                setSearch('');
                fetchTransactions();
              }}
            >
              <X size={16} color="#94a3b8" />
            </button>
          )}
        </form>

        <div className="filter-group">
          {/* Type Filter */}
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expense Only</option>
          </select>

          {/* Category Filter */}
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Start Date */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            title="Start Date"
          />

          {/* End Date */}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            title="End Date"
          />

          {/* Reset button */}
          <button
            type="button"
            className="btn-secondary"
            onClick={handleResetFilters}
            title="Clear All Filters"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Filter Stats Pill */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '16px',
          fontSize: '0.9rem',
          fontWeight: 600,
        }}
      >
        <span style={{ color: '#64748b' }}>
          Total Items: <strong>{transactions.length}</strong>
        </span>
        <span style={{ color: '#10b981' }}>
          Income: <strong>₹{filteredIncome.toLocaleString('en-IN')}</strong>
        </span>
        <span style={{ color: '#ef4444' }}>
          Expenses: <strong>₹{filteredExpense.toLocaleString('en-IN')}</strong>
        </span>
      </div>

      {/* Table Card */}
      <div className="section-card">
        {loading ? (
          <div className="empty-state">
            <p>Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="auth-alert error">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <p>No transactions match your criteria.</p>
            <button
              className="btn-secondary"
              style={{ marginTop: 12 }}
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td>
                      <strong>{tx.title}</strong>
                      {tx.description && (
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {tx.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge category">{tx.category}</span>
                    </td>
                    <td>{new Date(tx.date).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span className={`badge ${tx.type}`}>{tx.type}</span>
                    </td>
                    <td>
                      <span
                        className={
                          tx.type === 'income' ? 'amount-income' : 'amount-expense'
                        }
                      >
                        {tx.type === 'income' ? '+' : '-'}₹
                        {Number(tx.amount).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="btn-icon edit"
                          title="Edit"
                          onClick={() => onOpenAddModal(tx)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-icon delete"
                          title="Delete"
                          onClick={() => handleDelete(tx._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;

