import React from 'react';
import { PlusCircle, Menu, Wallet } from 'lucide-react';

const Navbar = ({ user, onOpenAddModal, toggleSidebar }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="mobile-menu-btn"
          onClick={toggleSidebar}
          title="Toggle Navigation"
        >
          <Menu size={24} />
        </button>
        <div className="navbar-greeting">
          <h3>Hello, {user ? user.name : 'User'} 👋</h3>
          <p>{currentDate}</p>
        </div>
      </div>

      <div className="navbar-right">
        <button
          className="btn-primary"
          onClick={() => onOpenAddModal(null)}
        >
          <PlusCircle size={18} />
          <span>Add Transaction</span>
        </button>

        <div className="user-profile-badge">
          <div className="user-avatar">
            {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-info">
            <div className="user-name">{user ? user.name : 'Student'}</div>
            <div className="user-email">{user ? user.email : ''}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

