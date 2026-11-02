import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AddTransaction from './components/AddTransaction';
import Dashboard from './pages/Dashboard';
import TransactionList from './pages/TransactionList';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard', 'transactions', 'reports'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Transaction Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Check for existing login on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setAuthView('login');
  };

  const handleOpenAddModal = (transaction = null) => {
    setEditingTransaction(transaction);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setEditingTransaction(null);
    setIsAddModalOpen(false);
  };

  const handleTransactionSuccess = () => {
    // Trigger re-render of current view
    setRefreshKey((prev) => prev + 1);
  };

  // If not logged in, render authentication flow
  if (!user) {
    if (authView === 'login') {
      return (
        <Login
          onSwitchToRegister={() => setAuthView('register')}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    } else {
      return (
        <Register
          onSwitchToLogin={() => setAuthView('login')}
          onRegisterSuccess={handleRegisterSuccess}
        />
      );
    }
  }

  // Logged-in application layout
  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={(page) => {
          setCurrentPage(page);
          setIsSidebarOpen(false); // Close mobile sidebar on select
        }}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          user={user}
          onOpenAddModal={handleOpenAddModal}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main>
          {currentPage === 'dashboard' && (
            <Dashboard
              key={refreshKey}
              onOpenAddModal={handleOpenAddModal}
              onViewAllTransactions={() => setCurrentPage('transactions')}
            />
          )}

          {currentPage === 'transactions' && (
            <TransactionList
              key={refreshKey}
              onOpenAddModal={handleOpenAddModal}
            />
          )}

          {currentPage === 'reports' && (
            <Reports key={refreshKey} />
          )}
        </main>
      </div>

      {/* Add / Edit Transaction Modal */}
      <AddTransaction
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSuccess={handleTransactionSuccess}
        initialData={editingTransaction}
      />
    </div>
  );
}

export default App;
