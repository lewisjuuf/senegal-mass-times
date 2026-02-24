import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import parishService from '../../services/parishService';
import AdminNavbar from '../../components/layout/AdminNavbar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { Users, Plus, Edit2, Trash2, AlertCircle, Key, CheckCircle, XCircle, Clock, Newspaper } from 'lucide-react';

/**
 * Master Admin Dashboard
 * Full CRUD interface for managing all parishes
 */
const MasterDashboardPage = () => {
  const navigate = useNavigate();
  const { isMasterAdmin } = useAuth();
  const [parishes, setParishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false);
  const [selectedParish, setSelectedParish] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Pending registrations
  const [pendingParishes, setPendingParishes] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);

  // Form state for parish info
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    region: '',
    address: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    website: '',
    diocese_id: 1,
  });

  // Form state for credentials (create only)
  const [createCredentials, setCreateCredentials] = useState({
    admin_email: '',
    admin_password: '',
  });

  // Form state for credentials update
  const [credentialsData, setCredentialsData] = useState({
    admin_email: '',
    admin_password: '',
  });

  useEffect(() => {
    // Redirect if not master admin
    if (!isMasterAdmin) {
      window.location.href = '/admin/dashboard';
      return;
    }
    fetchParishes();
    fetchPending();
  }, [isMasterAdmin]);

  const fetchParishes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await parishService.getAllParishes();
      setParishes(data);
    } catch (err) {
      console.error('Error fetching parishes:', err);
      setError('Impossible de charger les paroisses');
    } finally {
      setLoading(false);
    }
  };

  const fetchPending = async () => {
    try {
      setPendingLoading(true);
      const data = await parishService.getPendingRegistrations();
      setPendingParishes(data);
    } catch (err) {
      console.error('Error fetching pending registrations:', err);
    } finally {
      setPendingLoading(false);
    }
  };

  const handleApprove = async (parishId) => {
    try {
      setError(null);
      await parishService.approveParish(parishId);
      setSuccess('Paroisse approuvée avec succès');
      fetchPending();
      fetchParishes();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error approving parish:', err);
      setError('Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (parishId) => {
    try {
      setError(null);
      await parishService.rejectParish(parishId);
      setSuccess('Inscription rejetée');
      fetchPending();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error rejecting parish:', err);
      setError('Erreur lors du rejet');
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      city: '',
      region: '',
      address: '',
      latitude: '',
      longitude: '',
      phone: '',
      email: '',
      website: '',
      diocese_id: 1,
    });
    setCreateCredentials({
      admin_email: '',
      admin_password: '',
    });
    setAddModalOpen(true);
  };

  const handleOpenEdit = (parish) => {
    setSelectedParish(parish);
    setFormData({
      name: parish.name,
      city: parish.city,
      region: parish.region || '',
      address: parish.address || '',
      latitude: parish.latitude?.toString() || '',
      longitude: parish.longitude?.toString() || '',
      phone: parish.phone || '',
      email: parish.email || '',
      website: parish.website || '',
      diocese_id: parish.diocese_id,
    });
    setEditModalOpen(true);
  };

  const handleOpenDelete = (parish) => {
    setSelectedParish(parish);
    setDeleteModalOpen(true);
  };

  const handleOpenCredentials = (parish) => {
    setSelectedParish(parish);
    setCredentialsData({
      admin_email: parish.admin_email,
      admin_password: '',
    });
    setCredentialsModalOpen(true);
  };

  const handleCloseModals = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setCredentialsModalOpen(false);
    setSelectedParish(null);
    setSubmitting(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCredentialsChange = (e) => {
    const { name, value } = e.target;
    if (addModalOpen) {
      setCreateCredentials((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setCredentialsData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddParish = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      // Prepare data
      const parishData = {
        ...formData,
        ...createCredentials,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      // Remove empty strings
      Object.keys(parishData).forEach(key => {
        if (parishData[key] === '') {
          parishData[key] = null;
        }
      });

      await parishService.createParish(parishData);
      setSuccess('Paroisse créée avec succès');
      handleCloseModals();
      fetchParishes();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error creating parish:', err);
      setError(err.response?.data?.detail || 'Erreur lors de la création de la paroisse');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditParish = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      // Prepare data
      const updateData = { ...formData };
      updateData.latitude = updateData.latitude ? parseFloat(updateData.latitude) : null;
      updateData.longitude = updateData.longitude ? parseFloat(updateData.longitude) : null;

      // Remove empty strings
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '') {
          updateData[key] = null;
        }
      });

      await parishService.updateParishAdmin(selectedParish.id, updateData);
      setSuccess('Paroisse modifiée avec succès');
      handleCloseModals();
      fetchParishes();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating parish:', err);
      setError('Erreur lors de la modification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteParish = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await parishService.deleteParish(selectedParish.id);
      setSuccess('Paroisse supprimée avec succès');
      handleCloseModals();
      fetchParishes();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting parish:', err);
      setError(err.response?.data?.detail || 'Erreur lors de la suppression');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      // Only send non-empty fields
      const updateData = {};
      if (credentialsData.admin_email && credentialsData.admin_email !== selectedParish.admin_email) {
        updateData.admin_email = credentialsData.admin_email;
      }
      if (credentialsData.admin_password) {
        updateData.admin_password = credentialsData.admin_password;
      }

      if (Object.keys(updateData).length === 0) {
        setError('Aucune modification à apporter');
        setSubmitting(false);
        return;
      }

      await parishService.updateCredentials(selectedParish.id, updateData);
      setSuccess('Identifiants mis à jour avec succès');
      handleCloseModals();
      fetchParishes();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating credentials:', err);
      setError(err.response?.data?.detail || 'Erreur lors de la mise à jour');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isMasterAdmin) {
    return null;
  }

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <LoadingSpinner />
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestion des Paroisses
              </h1>
              <p className="text-gray-600">
                Gérez toutes les paroisses du système
              </p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              Ajouter une paroisse
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
            ✓ {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Pending Registrations */}
        {pendingParishes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              Inscriptions en attente ({pendingParishes.length})
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-yellow-200">
                  <thead className="bg-yellow-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">
                        Ville
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">
                        Email Admin
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-yellow-800 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-yellow-200">
                    {pendingParishes.map((parish) => (
                      <tr key={parish.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {parish.name}
                          </div>
                          {parish.region && (
                            <div className="text-sm text-gray-500">
                              {parish.region}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {parish.city}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {parish.admin_email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(parish.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approuver
                            </button>
                            <button
                              onClick={() => handleReject(parish.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              Rejeter
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Parishes Table */}
        {parishes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune paroisse
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par ajouter une nouvelle paroisse
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Ajouter une paroisse
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ville
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email Admin
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parishes.map((parish) => (
                    <tr key={parish.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {parish.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {parish.name}
                        </div>
                        {parish.region && (
                          <div className="text-sm text-gray-500">
                            {parish.region}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {parish.city}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {parish.admin_email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/mass-times?parish=${parish.id}`)}
                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Gérer les messes"
                          >
                            <Clock className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/news?parish=${parish.id}`)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Gérer les actualités"
                          >
                            <Newspaper className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(parish)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(parish)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Parish Modal */}
        <Modal
          isOpen={addModalOpen}
          onClose={handleCloseModals}
          title="Ajouter une paroisse"
          size="lg"
        >
          <form onSubmit={handleAddParish} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la paroisse *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: Paroisse Saint-Pierre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: Dakar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Région
                </label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: Dakar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: +221 33 XXX XX XX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email public
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: contact@paroisse.sn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site web
                </label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: https://paroisse.sn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: 14.6928"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ex: -17.4467"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: Avenue Malick Sy, Dakar"
              />
            </div>

            {/* Admin Credentials Section */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Identifiants administrateur
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email admin *
                  </label>
                  <input
                    type="email"
                    name="admin_email"
                    value={createCredentials.admin_email}
                    onChange={handleCredentialsChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: admin@paroisse.sn"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    name="admin_password"
                    value={createCredentials.admin_password}
                    onChange={handleCredentialsChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Mot de passe"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleCloseModals}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Création...' : 'Créer la paroisse'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit Parish Modal */}
        <Modal
          isOpen={editModalOpen}
          onClose={handleCloseModals}
          title="Modifier la paroisse"
          size="lg"
        >
          <form onSubmit={handleEditParish} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la paroisse *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Région
                </label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email public
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site web
                </label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleCloseModals}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Modification...' : 'Modifier'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Credentials Modal */}
        <Modal
          isOpen={credentialsModalOpen}
          onClose={handleCloseModals}
          title="Modifier les identifiants"
        >
          <form onSubmit={handleUpdateCredentials} className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                Laissez les champs vides si vous ne souhaitez pas les modifier
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email admin
              </label>
              <input
                type="email"
                name="admin_email"
                value={credentialsData.admin_email}
                onChange={handleCredentialsChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                name="admin_password"
                value={credentialsData.admin_password}
                onChange={handleCredentialsChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Laisser vide pour ne pas modifier"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCloseModals}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={handleCloseModals}
          title="Supprimer la paroisse"
        >
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">
                ⚠️ Attention: Cette action est irréversible!
              </p>
              <p className="text-red-700 text-sm mt-2">
                Tous les horaires de messes et actualités associés seront également supprimés.
              </p>
            </div>

            <p className="text-gray-700">
              Êtes-vous sûr de vouloir supprimer cette paroisse ?
            </p>

            {selectedParish && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-900">{selectedParish.name}</p>
                <p className="text-sm text-gray-600">{selectedParish.city}</p>
                <p className="text-sm text-gray-600">{selectedParish.admin_email}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCloseModals}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteParish}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default MasterDashboardPage;
