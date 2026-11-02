import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PieChart as PieIcon,
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
import { Bar, Pie } from 'react-chartjs-2';
import api from '../api/axios';

const Reports = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async (selectedYear) => {
    try {
      setLoading(true);
      const res = await api.get('/transactions/reports', {
        params: { year: selectedYear },
      });
      if (res.data.success) {
        setReportData(res.data.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to fetch monthly reports.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(year);
  }, [year]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="empty-state">
          <p>Generating annual financial report...</p>
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
    monthlyData = [],
    categoryTotals = [],
    totalYearIncome = 0,
    totalYearExpense = 0,
    totalYearSavings = 0,
  } = reportData || {};

  // Savings rate
  const annualSavingsRate =
    totalYearIncome > 0
      ? Math.round((totalYearSavings / totalYearIncome) * 100)
      : 0;

  // Chart 1: 12 Months Cash Flow Bar Chart
  const monthsBarData = {
    labels: monthlyData.map((m) => m.monthName.substring(0, 3)),
    datasets: [
      {
        label: 'Income (₹)',
        data: monthlyData.map((m) => m.income),
        backgroundColor: '#10b981',
        borderRadius: 4,
      },
      {
        label: 'Expense (₹)',
        data: monthlyData.map((m) => m.expense),
        backgroundColor: '#ef4444',
        borderRadius: 4,
      },
      {
        label: 'Savings (₹)',
        data: monthlyData.map((m) => m.savings),
        backgroundColor: '#4f46e5',
        borderRadius: 4,
      },
    ],
  };

  // Chart 2: Annual Category Spending Pie Chart
  const pieColors = [
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

  const categoryPieData = {
    labels: categoryTotals.length > 0
      ? categoryTotals.map((c) => c.category)
      : ['No Expense Data'],
    datasets: [
      {
        data: categoryTotals.length > 0
          ? categoryTotals.map((c) => c.amount)
          : [1],
        backgroundColor: categoryTotals.length > 0
          ? pieColors.slice(0, categoryTotals.length)
          : ['#e2e8f0'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  return (
    <div className="page-wrapper">
      <div className="section-header">
        <div>
          <h2>Financial Reports & Analytics</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Comprehensive annual and monthly breakdowns of your earnings and expenses
          </p>
        </div>

        {/* Year Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Select Year:</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={{ fontWeight: 700 }}
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Metric Cards for Selected Year */}
      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-info">
            <div className="stat-title">{year} Total Income</div>
            <div className="stat-value">₹{totalYearIncome.toLocaleString('en-IN')}</div>
            <div className="stat-desc">Total earned in {year}</div>
          </div>
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="stat-card expense">
          <div className="stat-info">
            <div className="stat-title">{year} Total Expense</div>
            <div className="stat-value">₹{totalYearExpense.toLocaleString('en-IN')}</div>
            <div className="stat-desc">Total spent in {year}</div>
          </div>
          <div className="stat-icon">
            <TrendingDown size={24} />
          </div>
        </div>

        <div className="stat-card balance">
          <div className="stat-info">
            <div className="stat-title">{year} Net Savings</div>
            <div className="stat-value" style={{ color: totalYearSavings < 0 ? '#ef4444' : '#0f172a' }}>
              ₹{totalYearSavings.toLocaleString('en-IN')}
            </div>
            <div className="stat-desc">Savings Rate: {annualSavingsRate}%</div>
          </div>
          <div className="stat-icon">
            <PiggyBank size={24} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>
            <span>12-Month Performance Overview</span>
            <BarChart3 size={20} color="#64748b" />
          </h3>
          <div className="chart-container">
            <Bar
              data={monthsBarData}
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
            <span>Yearly Category Spending</span>
            <PieIcon size={20} color="#64748b" />
          </h3>
          <div className="chart-container">
            <Pie
              data={categoryPieData}
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

      {/* Monthly Breakdown Table */}
      <div className="section-card">
        <div className="section-header">
          <h3>Monthly Detailed Summary ({year})</h3>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Total Income</th>
                <th>Total Expenses</th>
                <th>Net Savings</th>
                <th>Savings Rate</th>
                <th>Transactions</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((m) => {
                const savingsRate =
                  m.income > 0 ? Math.round((m.savings / m.income) * 100) : 0;
                return (
                  <tr key={m.monthIndex}>
                    <td><strong>{m.monthName}</strong></td>
                    <td className="amount-income">₹{m.income.toLocaleString('en-IN')}</td>
                    <td className="amount-expense">₹{m.expense.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 700, color: m.savings < 0 ? '#ef4444' : '#10b981' }}>
                      ₹{m.savings.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className="badge category">
                        {savingsRate >= 0 ? `${savingsRate}%` : '0%'}
                      </span>
                    </td>
                    <td>{m.transactionCount} transactions</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;

