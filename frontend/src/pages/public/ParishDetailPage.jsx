import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import parishService from '../../services/parishService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft, MapPin, Phone, Globe, Mail, Clock, Newspaper } from 'lucide-react';
import { getDayName, getLanguageName, translateMassType, DAY_ORDER } from '../../utils/translations';

/**
 * Public Parish Detail Page
 * Shows full parish information and mass schedule
 */
const ParishDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parish, setParish] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchParish();
    fetchNews();
  }, [id]);

  const fetchParish = async () => {
    try {
      setLoading(true);
      const data = await parishService.getParishById(id);
      setParish(data);
    } catch (err) {
      console.error('Error fetching parish:', err);
      setError('Paroisse non trouvée');
    } finally {
      setLoading(false);
    }
  };

  const fetchNews = async () => {
    try {
      const newsData = await parishService.getParishNews(id);
      setNews(newsData);
    } catch (err) {
      console.error('Error fetching news:', err);
      // Don't set error for news - just log it
    }
  };

  // Group masses by day
  const groupedMasses = parish
    ? DAY_ORDER.map((day) => ({
        day,
        dayFr: getDayName(day),
        masses: (parish.mass_times || [])
          .filter((m) => m.day_of_week === day)
          .sort((a, b) => a.time.localeCompare(b.time)),
      })).filter((d) => d.masses.length > 0)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner message="Chargement de la paroisse..." />
      </div>
    );
  }

  if (error || !parish) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
          <button
            onClick={() => navigate('/search')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Retour à la recherche
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/search')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour à la recherche</span>
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Parish Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-3xl">✝</span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {parish.name}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>
                  {parish.city}
                  {parish.region && `, ${parish.region}`}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
            {parish.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Adresse</p>
                  <p className="text-gray-900">{parish.address}</p>
                </div>
              </div>
            )}

            {parish.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Téléphone</p>
                  <a
                    href={`tel:${parish.phone}`}
                    className="text-gray-900 hover:text-primary-600"
                  >
                    {parish.phone}
                  </a>
                </div>
              </div>
            )}

            {parish.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <a
                    href={`mailto:${parish.email}`}
                    className="text-gray-900 hover:text-primary-600"
                  >
                    {parish.email}
                  </a>
                </div>
              </div>
            )}

            {parish.website && (
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Site web</p>
                  <a
                    href={parish.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 hover:text-primary-600"
                  >
                    {parish.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mass Schedule */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Horaires des messes
            </h2>
          </div>

          {groupedMasses.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              Aucun horaire de messe disponible pour cette paroisse
            </p>
          ) : (
            <div className="space-y-6">
              {groupedMasses.map(({ day, dayFr, masses }) => (
                <div key={day} className="border-l-4 border-primary-600 pl-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {dayFr}
                  </h3>
                  <div className="space-y-3">
                    {masses.map((mass) => (
                      <div
                        key={mass.id}
                        className="flex items-start justify-between py-2"
                      >
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {mass.time}
                          </div>
                          <div className="text-sm text-gray-600">
                            {getLanguageName(mass.language)}
                            {mass.mass_type && ` • ${translateMassType(mass.mass_type)}`}
                          </div>
                          {mass.notes && (
                            <div className="text-sm text-gray-500 italic mt-1">
                              {mass.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Parish News Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <div className="flex items-center gap-3 mb-6">
            <Newspaper className="w-7 h-7 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Actualités de la paroisse
            </h2>
          </div>

          {news.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Aucune actualité disponible pour le moment</p>
            </div>
          ) : (
            <div className="space-y-6">
              {news.map((item) => (
                <article
                  key={item.id}
                  className="border-l-4 border-primary-600 pl-6 pb-6 border-b last:border-b-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                    <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                      {item.category === 'Event' ? 'Événement' :
                       item.category === 'Announcement' ? 'Annonce' : 'Général'}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3 whitespace-pre-wrap leading-relaxed">
                    {item.content}
                  </p>
                  <time className="text-sm text-gray-500">
                    Publié le {new Date(item.publish_date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </time>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/search')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Retour à la recherche
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParishDetailPage;
