import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import parishService from '../../services/parishService';
import AdminNavbar from '../../components/layout/AdminNavbar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Clock, Info, Calendar, MapPin } from 'lucide-react';

/**
 * Admin Dashboard Page
 * Welcome page with parish summary and quick actions (French UI)
 */
const DashboardPage = () => {
  const { parishInfo } = useAuth();
  const [parish, setParish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchParishData();
  }, []);

  const fetchParishData = async () => {
    try {
      setLoading(true);
      const data = await parishService.getMyParish();
      setParish(data);
    } catch (err) {
      console.error('Error fetching parish:', err);
      setError('Impossible de charger les données de la paroisse');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <LoadingSpinner message="Chargement du tableau de bord..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const massCount = parish?.mass_times?.length || 0;
  const activeMassCount =
    parish?.mass_times?.filter((m) => m.is_active).length || 0;

  // Count masses by day
  const sundayMasses =
    parish?.mass_times?.filter((m) => m.day_of_week === 'Sunday').length || 0;
  const weekdayMasses =
    parish?.mass_times?.filter((m) => m.day_of_week !== 'Sunday').length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue, {parish?.name}
          </h1>
          <p className="text-gray-600">
            Gérez les informations et les horaires de votre paroisse
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Masses Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total des messes</p>
                <p className="text-3xl font-bold text-gray-900">{massCount}</p>
              </div>
              <div className="bg-primary-50 p-3 rounded-lg">
                <Clock className="w-8 h-8 text-primary-600" />
              </div>
            </div>
          </div>

          {/* Active Masses Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Messes actives</p>
                <p className="text-3xl font-bold text-gray-900">
                  {activeMassCount}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Sunday Masses Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Messes dimanche</p>
                <p className="text-3xl font-bold text-gray-900">
                  {sundayMasses}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Weekday Masses Card */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Messes semaine</p>
                <p className="text-3xl font-bold text-gray-900">
                  {weekdayMasses}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Actions rapides
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              to="/admin/mass-times"
              className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
            >
              <div className="bg-primary-100 p-3 rounded-lg group-hover:bg-primary-200 transition-colors">
                <Clock className="w-6 h-6 text-primary-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-700">
                  Gérer les horaires des messes
                </h3>
                <p className="text-sm text-gray-600">
                  Ajouter, modifier ou supprimer des messes
                </p>
              </div>
            </Link>

            <Link
              to="/admin/parish-info"
              className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
            >
              <div className="bg-primary-100 p-3 rounded-lg group-hover:bg-primary-200 transition-colors">
                <Info className="w-6 h-6 text-primary-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-700">
                  Modifier les informations
                </h3>
                <p className="text-sm text-gray-600">
                  Coordonnées, adresse et autres détails
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Parish Info Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Informations de la paroisse
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nom</p>
                <p className="font-medium text-gray-900">{parish?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Ville</p>
                <p className="font-medium text-gray-900">
                  {parish?.city}
                  {parish?.region && `, ${parish.region}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Adresse</p>
                <p className="font-medium text-gray-900">
                  {parish?.address || 'Non renseignée'}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Téléphone</p>
                <p className="font-medium text-gray-900">
                  {parish?.phone || 'Non renseigné'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-medium text-gray-900">
                  {parish?.email || 'Non renseigné'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Site web</p>
                <p className="font-medium text-gray-900">
                  {parish?.website || 'Non renseigné'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
