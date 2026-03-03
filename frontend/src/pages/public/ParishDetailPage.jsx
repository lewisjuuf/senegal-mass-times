import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import parishService from '../../services/parishService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { ArrowLeft, MapPin, Phone, Globe, Mail, Clock, Newspaper, Copy, Check } from 'lucide-react';
import { getDayName, getLanguageName, translateMassType, DAY_ORDER, formatTime } from '../../utils/translations';

// Map JS getDay() (0=Sunday) to English day names
const JS_DAY_TO_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Compute the next upcoming mass from a list of mass times.
 * Returns { mass, dayEn, dayFr } or null.
 */
function getNextMass(massTimes) {
  if (!massTimes || massTimes.length === 0) return null;

  const now = new Date();
  const currentDayIdx = now.getDay(); // 0=Sunday
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' +
    now.getMinutes().toString().padStart(2, '0');

  // Build ordered list starting from today, wrapping around the week
  for (let offset = 0; offset < 7; offset++) {
    const dayIdx = (currentDayIdx + offset) % 7;
    const dayEn = JS_DAY_TO_EN[dayIdx];
    const dayMasses = massTimes
      .filter((m) => m.day_of_week === dayEn)
      .sort((a, b) => a.time.localeCompare(b.time));

    for (const mass of dayMasses) {
      // For today, skip masses that already happened
      if (offset === 0 && mass.time <= currentTime) continue;
      return { mass, dayEn, dayFr: getDayName(dayEn) };
    }
  }
  return null;
}

/**
 * Public Parish Detail Page
 * Shows full parish information, mass schedule, next mass highlight, and sharing
 */
const ParishDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parish, setParish] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

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

  // Compute next mass
  const nextMass = useMemo(
    () => (parish ? getNextMass(parish.mass_times) : null),
    [parish]
  );

  // WhatsApp share
  const handleWhatsAppShare = () => {
    const lines = [`${parish.name} - ${parish.city}`];
    if (nextMass) {
      lines.push(`Prochaine messe: ${nextMass.dayFr} à ${formatTime(nextMass.mass.time)}`);
    }
    lines.push(window.location.href);
    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

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

          {/* Share Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#1da851] transition-colors text-sm font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Partager sur WhatsApp
            </button>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Lien copié !' : 'Copier le lien'}
            </button>
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

        {/* Next Mass Highlight */}
        {nextMass && (
          <div className="bg-gradient-to-r from-primary-50 to-green-50 border-2 border-primary-200 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-600 uppercase tracking-wide">Prochaine messe</p>
                <p className="text-xl font-bold text-gray-900">
                  {nextMass.dayFr} à {formatTime(nextMass.mass.time)}
                </p>
                <p className="text-sm text-gray-600">
                  {getLanguageName(nextMass.mass.language)}
                  {nextMass.mass.mass_type && ` · ${translateMassType(nextMass.mass.mass_type)}`}
                </p>
              </div>
            </div>
          </div>
        )}

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
                    {masses.map((mass) => {
                      const isNext = nextMass && nextMass.mass.id === mass.id;
                      return (
                        <div
                          key={mass.id}
                          className={`flex items-start justify-between py-2 px-3 rounded-lg transition-colors ${isNext ? 'bg-primary-50' : ''}`}
                        >
                          <div>
                            <div className="text-lg font-semibold text-gray-900">
                              {formatTime(mass.time)}
                              {isNext && (
                                <span className="ml-2 text-xs font-medium text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full">
                                  Prochaine
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {getLanguageName(mass.language)}
                              {mass.mass_type && ` · ${translateMassType(mass.mass_type)}`}
                            </div>
                            {mass.notes && (
                              <div className="text-sm text-gray-500 italic mt-1">
                                {mass.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
                  {item.event_start_date && (
                    <p className="text-sm text-primary-700 font-medium mb-2">
                      {item.event_end_date
                        ? `Du ${new Date(item.event_start_date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} au ${new Date(item.event_end_date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                        : `${new Date(item.event_start_date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                    </p>
                  )}
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
            Retour à la recherche
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParishDetailPage;
