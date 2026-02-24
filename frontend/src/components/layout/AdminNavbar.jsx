import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Clock, Newspaper, Info, LogOut, Menu, X, Users, Lock } from 'lucide-react';

/**
 * Admin Navbar Component
 * Navigation bar for parish admin dashboard (French UI)
 */
const AdminNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { parishInfo, isMasterAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navLinks = [
    // Parish admin links (hidden for master admin)
    ...(!isMasterAdmin ? [
      {
        to: '/admin/dashboard',
        label: 'Tableau de bord',
        icon: LayoutDashboard,
      },
      {
        to: '/admin/mass-times',
        label: 'Horaires des messes',
        icon: Clock,
      },
      {
        to: '/admin/news',
        label: 'Actualités',
        icon: Newspaper,
      },
      {
        to: '/admin/parish-info',
        label: 'Informations',
        icon: Info,
      },
    ] : []),
    // Master Admin link
    ...(isMasterAdmin ? [{
      to: '/admin/master-dashboard',
      label: 'Gestion des Paroisses',
      icon: Users,
    }] : []),
    {
      to: '/admin/change-password',
      label: 'Mot de passe',
      icon: Lock,
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Parish Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">✝</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-gray-900">
                Administration Paroissiale
              </h1>
              {parishInfo?.name && (
                <p className="text-sm text-gray-600">{parishInfo.name}</p>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive(link.to)
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {/* Parish Name on Mobile */}
            {parishInfo?.name && (
              <div className="px-4 py-2 mb-2">
                <p className="text-sm font-medium text-gray-900">
                  {parishInfo.name}
                </p>
              </div>
            )}

            {/* Mobile Navigation Links */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                      isActive(link.to)
                        ? 'bg-primary-50 text-primary-700 font-medium border-l-4 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {/* Mobile Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;
