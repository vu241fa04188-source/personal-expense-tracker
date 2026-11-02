import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  PlusCircle,
  ArrowRight,
  Edit2,
  Trash2,
  PieChart as PieIcon,
  BarChart2,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../api/axios';

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = ({ onOpenAddModal, onViewAllTransactions }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions/summary');
      if (res.data.success) {
        setSummary(res.data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard summary.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`);
        fetchDashboardData();
      } catch (err) {
        alert('Failed to delete transaction.');
      }
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="empty-state">
          <p>Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="auth-alert error">{error}</div>
      </div>
    );
  }

  const {
    totalIncome = 0,
    totalExpense = 0,
    balance = 0,
    categoryBreakdown = [],
    monthlyBreakdown = [],
    recentTransactions = [],
  } = summary || {};

  // 1. Data for Monthly Income vs Expense Bar Chart
  const monthlyChartData = {
    labels: monthlyBreakdown.length > 0
      ? monthlyBreakdown.map((m) => m.label)
      : ['No Data'],
    datasets: [
      {
        label: 'Income (₹)',
        data: monthlyBreakdown.length > 0 ? monthlyBreakdown.map((m) => m.income) : [0],
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
      {
        label: 'Expenses (₹)',
        data: monthlyBreakdown.length > 0 ? monthlyBreakdown.map((m) => m.expense) : [0],
        backgroundColor: '#ef4444',
        borderRadius: 6,
      },
    ],
  };

  // 2. Data for Category-wise Expense Doughnut Chart
  const doughnutColors = [
    '#4f46e5',
    '#f59e0b',
    '#10b981',
    '#ef4444',
    '#06b6d4',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f97316',
    '#64748b',
  ];

  const categoryChartData = {
    labels: categoryBreakdown.length > 0
      ? categoryBreakdown.map((c) => c.category)
      : ['No Expenses Yet'],
    datasets: [
      {
        data: categoryBreakdown.length > 0
          ? categoryBreakdown.map((c) => c.amount)
          : [1],
        backgroundColor: categoryBreakdown.length > 0
          ? doughnutColors.slice(0, categoryBreakdown.length)
          : ['#e2e8f0'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  return (
    <div className="page-wrapper">
      {/* 3 Metric Cards */}
      <div className="stats-grid">
        {/* Income Card */}
        <div className="stat-card income">
          <div className="stat-info">
            <div className="stat-title">Total Income</div>
            <div className="stat-value">₹{totalIncome.toLocaleString('en-IN')}</div>
            <div className="stat-desc">All lifetime recorded income</div>
          </div>
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Expenses Card */}
        <div className="stat-card expense">
          <div className="stat-info">
            <div className="stat-title">Total Expenses</div>
            <div className="stat-value">₹{totalExpense.toLocaleString('en-IN')}</div>
            <div className="stat-desc">Total outgoing expenditures</div>
          </div>
          <div className="stat-icon">
            <TrendingDown size={24} />
          </div>
        </div>

        {/* Balance Card */}
        <div className="stat-card balance">
          <div className="stat-info">
            <div className="stat-title">Remaining Balance</div>
            <div className="stat-value" style={{ color: balance < 0 ? '#ef4444' : '#0f172a' }}>
              ₹{balance.toLocaleString('en-IN')}
            </div>
            <div className="stat-desc">Net available savings</div>
          </div>
          <div className="stat-icon">
            <Wallet size={24} />
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>
            <span>Monthly Cash Flow</span>
            <BarChart2 size={20} color="#64748b" />
          </h3>
          <div className="chart-container">
            <Bar
              data={monthlyChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3>
            <span>Category Spending</span>
            <PieIcon size={20} color="#64748b" />
          </h3>
          <div className="chart-container">
            <Doughnut
              data={categoryChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="section-card">
        <div className="section-header">
          <h3>Recent Transactions</h3>
          <span className="view-all-link" onClick={onViewAllTransactions}>
            View All Transactions &rarr;
          </span>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="empty-state">
            <p>No transactions added yet.</p>
            <button
              className="btn-primary"
              style={{ marginTop: 12 }}
              onClick={() => onOpenAddModal(null)}
            >
              <PlusCircle size={18} />
              <span>Add Your First Transaction</span>
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
                {recentTransactions.map((tx) => (
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
                      <span className={`badge ${tx.type}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td>
                      <span className={tx.type === 'income' ? 'amount-income' : 'amount-expense'}>
                        {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount).toLocaleString('en-IN')}
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

export default Dashboard;

