import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Check } from 'lucide-react';
import api from '../api/axios';

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Allowance',
  'Investments',
  'Gifts',
  'Other Income',
];

const EXPENSE_CATEGORIES = [
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

const AddTransaction = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: EXPENSE_CATEGORIES[0],
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Set or reset form data when initialData or modal opens
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        amount: initialData.amount || '',
        type: initialData.type || 'expense',
        category: initialData.category || (initialData.type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]),
        date: initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
        description: initialData.description || '',
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        type: 'expense',
        category: EXPENSE_CATEGORIES[0],
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
    }
    setError('');
  }, [initialData, isOpen]);

  // Handle Type Change (Income / Expense) and update default category
  const handleTypeChange = (selectedType) => {
    setFormData((prev) => ({
      ...prev,
      type: selectedType,
      category: selectedType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please enter a transaction title');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    try {
      setLoading(true);
      if (initialData && initialData._id) {
        // Update existing transaction
        await api.put(`/transactions/${initialData._id}`, formData);
      } else {
        // Add new transaction
        await api.post('/transactions', formData);
      }
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err) {
      setLoading(false);
      setError(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'Failed to save transaction. Please try again.'
      );
    }
  };

  if (!isOpen) return null;

  const currentCategories =
    formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initialData ? 'Edit Transaction' : 'Add New Transaction'}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="auth-alert error">{error}</div>}

            {/* Type Selector (Income vs Expense) */}
            <div className="type-selector">
              <button
                type="button"
                className={`type-btn ${formData.type === 'income' ? 'active income' : ''}`}
                onClick={() => handleTypeChange('income')}
              >
                <TrendingUp size={18} />
                <span>Income</span>
              </button>
              <button
                type="button"
                className={`type-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
                onClick={() => handleTypeChange('expense')}
              >
                <TrendingDown size={18} />
                <span>Expense</span>
              </button>
            </div>

            {/* Title */}
            <div className="form-group">
              <label>Transaction Title *</label>
              <input
                type="text"
                name="title"
                placeholder="e.g. Monthly Salary, Grocery, Books"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Amount */}
            <div className="form-group">
              <label>Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="amount"
                placeholder="e.g. 500"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {currentCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            {/* Description (Optional) */}
            <div className="form-group">
              <label>Description / Note (Optional)</label>
              <textarea
                name="description"
                rows="2"
                placeholder="Additional notes about this transaction..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              <Check size={18} />
              <span>{loading ? 'Saving...' : initialData ? 'Update Transaction' : 'Save Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;

