import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import parishService from '../../services/parishService';
import AdminNavbar from '../../components/layout/AdminNavbar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { Newspaper, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';

/**
 * Parish News Management Page
 * Full CRUD interface for managing parish news and activities
 * Supports ?parish=ID query param for master admin to manage any parish
 */
const NewsPage = () => {
  const { parishInfo, isMasterAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const targetParishId = searchParams.get('parish') ? parseInt(searchParams.get('parish'), 10) : parishInfo?.id;
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    event_start_date: '',
    event_end_date: '',
  });

  useEffect(() => {
    fetchNews();
  }, [targetParishId]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = targetParishId !== parishInfo?.id
        ? await parishService.getParishNews(targetParishId)
        : await parishService.getMyParishNews();
      setNews(data);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Impossible de charger les actualités');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      content: '',
      category: 'General',
      event_start_date: '',
      event_end_date: '',
    });
    setAddModalOpen(true);
  };

  const handleOpenEdit = (newsItem) => {
    setSelectedNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      category: newsItem.category || 'General',
      event_start_date: newsItem.event_start_date || '',
      event_end_date: newsItem.event_end_date || '',
    });
    setEditModalOpen(true);
  };

  const handleOpenDelete = (newsItem) => {
    setSelectedNews(newsItem);
    setDeleteModalOpen(true);
  };

  const handleCloseModals = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setSelectedNews(null);
    setSubmitting(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddNews = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const payload = {
        ...formData,
        event_start_date: formData.event_start_date || null,
        event_end_date: formData.event_end_date || null,
      };
      await parishService.addNews(targetParishId, payload);
      setSuccess('Actualité ajoutée avec succès');
      handleCloseModals();
      fetchNews();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error adding news:', err);
      setError('Erreur lors de l\'ajout de l\'actualité');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditNews = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const payload = {
        ...formData,
        event_start_date: formData.event_start_date || null,
        event_end_date: formData.event_end_date || null,
      };
      await parishService.updateNews(targetParishId, selectedNews.id, payload);
      setSuccess('Actualité modifiée avec succès');
      handleCloseModals();
      fetchNews();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating news:', err);
      setError('Erreur lors de la modification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNews = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await parishService.deleteNews(targetParishId, selectedNews.id);
      setSuccess('Actualité supprimée avec succès');
      handleCloseModals();
      fetchNews();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting news:', err);
      setError('Erreur lors de la suppression');
    } finally {
      setSubmitting(false);
    }
  };

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
                Actualités de la paroisse
              </h1>
              <p className="text-gray-600">
                Gérez les nouvelles, événements et annonces de votre paroisse
              </p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              Ajouter une actualité
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

        {/* News List */}
        {news.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune actualité
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par ajouter une nouvelle actualité pour votre paroisse
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Ajouter une actualité
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {news.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {item.title}
                      </h3>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                      {item.content}
                    </p>
                    {item.event_start_date && (
                      <p className="text-sm text-primary-700 font-medium mb-2">
                        {item.event_end_date
                          ? `📅 Du ${new Date(item.event_start_date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} au ${new Date(item.event_end_date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                          : `📅 ${new Date(item.event_start_date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Publié le {new Date(item.publish_date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(item)}
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
        )}

        {/* Add News Modal */}
        <Modal
          isOpen={addModalOpen}
          onClose={handleCloseModals}
          title="Ajouter une actualité"
        >
          <form onSubmit={handleAddNews} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex: Messe spéciale de Noël"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenu *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Détails de l'actualité..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="General">Général</option>
                <option value="Event">Événement</option>
                <option value="Announcement">Annonce</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de l'événement (optionnel)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Début</label>
                  <input
                    type="date"
                    name="event_start_date"
                    value={formData.event_start_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                {formData.event_start_date && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Fin (optionnel)</label>
                    <input
                      type="date"
                      name="event_end_date"
                      value={formData.event_end_date}
                      onChange={handleChange}
                      min={formData.event_start_date}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                )}
              </div>
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
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Edit News Modal */}
        <Modal
          isOpen={editModalOpen}
          onClose={handleCloseModals}
          title="Modifier l'actualité"
        >
          <form onSubmit={handleEditNews} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenu *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="General">Général</option>
                <option value="Event">Événement</option>
                <option value="Announcement">Annonce</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de l'événement (optionnel)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Début</label>
                  <input
                    type="date"
                    name="event_start_date"
                    value={formData.event_start_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                {formData.event_start_date && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Fin (optionnel)</label>
                    <input
                      type="date"
                      name="event_end_date"
                      value={formData.event_end_date}
                      onChange={handleChange}
                      min={formData.event_start_date}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                )}
              </div>
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
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Modification...' : 'Modifier'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={handleCloseModals}
          title="Supprimer l'actualité"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Êtes-vous sûr de vouloir supprimer cette actualité ?
            </p>
            {selectedNews && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold text-gray-900">{selectedNews.title}</p>
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
                onClick={handleDeleteNews}
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

export default NewsPage;
