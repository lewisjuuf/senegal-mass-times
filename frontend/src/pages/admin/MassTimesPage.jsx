import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import parishService from '../../services/parishService';
import AdminNavbar from '../../components/layout/AdminNavbar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { Clock, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { getDayName, getLanguageName, translateMassType, DAY_ORDER } from '../../utils/translations';

/**
 * Mass Times Management Page
 * Full CRUD interface for managing parish mass schedules (French UI)
 * Supports ?parish=ID query param for master admin to manage any parish
 */
const MassTimesPage = () => {
  const { parishInfo, isMasterAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const targetParishId = searchParams.get('parish') ? parseInt(searchParams.get('parish'), 10) : parishInfo?.id;
  const [parish, setParish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMass, setSelectedMass] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    day_of_week: 'Sunday',
    time: '',
    language: 'French',
    mass_type: '',
    notes: '',
  });

  useEffect(() => {
    fetchParishData();
  }, [targetParishId]);

  const fetchParishData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = targetParishId !== parishInfo?.id
        ? await parishService.getParishById(targetParishId)
        : await parishService.getMyParish();
      setParish(data);
    } catch (err) {
      console.error('Error fetching parish:', err);
      setError('Impossible de charger les horaires');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      day_of_week: 'Sunday',
      time: '',
      language: 'French',
      mass_type: '',
      notes: '',
    });
    setAddModalOpen(true);
  };

  const handleOpenEdit = (mass) => {
    setSelectedMass(mass);
    setFormData({
      day_of_week: mass.day_of_week,
      time: mass.time,
      language: mass.language || 'French',
      mass_type: mass.mass_type || '',
      notes: mass.notes || '',
    });
    setEditModalOpen(true);
  };

  const handleOpenDelete = (mass) => {
    setSelectedMass(mass);
    setDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setSelectedMass(null);
    setSubmitting(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddMass = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await parishService.addMassTime(targetParishId, formData);
      setSuccess('Messe ajoutée avec succès');
      await fetchParishData();
      handleCloseModals();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding mass:', err);
      setError(err.response?.data?.detail || 'Erreur lors de l\'ajout');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMass = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await parishService.updateMassTime(
        targetParishId,
        selectedMass.id,
        formData
      );
      setSuccess('Messe modifiée avec succès');
      await fetchParishData();
      handleCloseModals();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating mass:', err);
      setError(err.response?.data?.detail || 'Erreur lors de la modification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMass = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await parishService.deleteMassTime(targetParishId, selectedMass.id);
      setSuccess('Messe supprimée avec succès');
      await fetchParishData();
      handleCloseModals();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting mass:', err);
      setError(err.response?.data?.detail || 'Erreur lors de la suppression');
    } finally {
      setSubmitting(false);
    }
  };

  // Group masses by day
  const groupedMasses = DAY_ORDER.map((day) => ({
    day,
    dayFr: getDayName(day),
    masses: (parish?.mass_times || [])
      .filter((m) => m.day_of_week === day)
      .sort((a, b) => a.time.localeCompare(b.time)),
  })).filter((d) => d.masses.length > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <LoadingSpinner message="Chargement des horaires..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Horaires des messes
            </h1>
            <p className="text-gray-600">
              {parish?.name || 'Gérez les horaires de votre paroisse'}
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter une messe</span>
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
            <p className="text-green-800 font-medium">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Masses List */}
        {groupedMasses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune messe enregistrée
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par ajouter les horaires de vos messes
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Ajouter la première messe</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedMasses.map(({ day, dayFr, masses }) => (
              <div key={day} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-primary-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white">{dayFr}</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {masses.map((mass) => (
                    <div
                      key={mass.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <span className="text-2xl font-bold text-primary-600">
                              {mass.time}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                              {getLanguageName(mass.language)}
                            </span>
                          </div>
                          {mass.mass_type && (
                            <p className="text-gray-700 font-medium mb-1">
                              {translateMassType(mass.mass_type)}
                            </p>
                          )}
                          {mass.notes && (
                            <p className="text-gray-600 text-sm italic">
                              {mass.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleOpenEdit(mass)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(mass)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Mass Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={handleCloseModals}
        title="Ajouter une messe"
      >
        <form onSubmit={handleAddMass} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jour *
              </label>
              <select
                name="day_of_week"
                value={formData.day_of_week}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {DAY_ORDER.map((day) => (
                  <option key={day} value={day}>
                    {getDayName(day)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Langue
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="French">Français</option>
                <option value="Wolof">Wolof</option>
                <option value="English">Anglais</option>
                <option value="Serer">Sérère</option>
                <option value="Portuguese">Portugais</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de messe
              </label>
              <input
                type="text"
                name="mass_type"
                value={formData.mass_type}
                onChange={handleChange}
                placeholder="Ex: Messe principale"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Informations supplémentaires"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Ajout en cours...' : 'Ajouter'}
            </button>
            <button
              type="button"
              onClick={handleCloseModals}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Mass Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={handleCloseModals}
        title="Modifier la messe"
      >
        <form onSubmit={handleUpdateMass} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jour *
              </label>
              <select
                name="day_of_week"
                value={formData.day_of_week}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {DAY_ORDER.map((day) => (
                  <option key={day} value={day}>
                    {getDayName(day)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Langue
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="French">Français</option>
                <option value="Wolof">Wolof</option>
                <option value="English">Anglais</option>
                <option value="Serer">Sérère</option>
                <option value="Portuguese">Portugais</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de messe
              </label>
              <input
                type="text"
                name="mass_type"
                value={formData.mass_type}
                onChange={handleChange}
                placeholder="Ex: Messe principale"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Informations supplémentaires"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Modification en cours...' : 'Modifier'}
            </button>
            <button
              type="button"
              onClick={handleCloseModals}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleCloseModals}
        title="Supprimer la messe"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Êtes-vous sûr de vouloir supprimer cette messe ?
          </p>
          {selectedMass && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold text-gray-900">
                {getDayName(selectedMass.day_of_week)} à {selectedMass.time}
              </p>
              <p className="text-sm text-gray-600">{getLanguageName(selectedMass.language)}</p>
            </div>
          )}
          <p className="text-sm text-gray-600">
            Cette action est irréversible.
          </p>
          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={handleDeleteMass}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Suppression...' : 'Supprimer'}
            </button>
            <button
              onClick={handleCloseModals}
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MassTimesPage;
