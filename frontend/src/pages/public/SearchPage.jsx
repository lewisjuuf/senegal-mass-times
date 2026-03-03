import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import parishService from '../../services/parishService';
import { Search, MapPin, Phone, Clock, ArrowLeft, ChevronRight } from 'lucide-react';
import { DAYS_FR, DAY_ORDER, formatTime } from '../../utils/translations';

/**
 * Public Search Page with Interactive Search
 * Shows suggestions as user types, better UI
 * Supports day-of-week filtering
 */

// Map JS getDay() (0=Sunday) to English day names
const JS_DAY_TO_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [parishes, setParishes] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [dayFilter, setDayFilter] = useState(null); // null = all, or English day name

  // Auto-trigger search if q param is present on mount
  useEffect(() => {
    const initialQuery = searchParams.get('q');
    if (initialQuery && initialQuery.trim().length >= 2) {
      fetchParishes(initialQuery);
    }
  }, []);

  // Debounce search - trigger after user stops typing
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        fetchParishes(searchQuery);
      }, 300);

      return () => clearTimeout(timeoutId);
    } else if (searchQuery.trim().length === 0) {
      setParishes([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const fetchParishes = async (query) => {
    setLoading(true);
    setError(null);
    setShowResults(true);
    try {
      const params = query ? { city: query } : {};
      const data = await parishService.getParishes(params);
      setParishes(data);
    } catch (err) {
      console.error('Error fetching parishes:', err);
      setError('Erreur lors du chargement des paroisses');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setParishes([]);
    setShowResults(false);
  };

  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      setGeoError("Géolocalisation non supportée par votre navigateur");
      return;
    }

    setLoading(true);
    setGeoError(null);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        try {
          const data = await parishService.getNearbyParishes(latitude, longitude, 10);
          setParishes(data);
          setShowResults(true);
          setSearchQuery('');
        } catch (err) {
          console.error('Error fetching nearby parishes:', err);
          setError('Erreur lors de la recherche des paroisses à proximité');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setGeoError("Impossible d'obtenir votre position. Veuillez autoriser la géolocalisation.");
        setLoading(false);
      }
    );
  };

  // Filter parishes by selected day
  const todayEn = JS_DAY_TO_EN[new Date().getDay()];
  const filteredParishes = dayFilter
    ? parishes.filter((p) => p.mass_times?.some((m) => m.day_of_week === dayFilter))
    : parishes;

  // Get matching masses for a parish on the filtered day
  const getMatchingMasses = (parish) => {
    if (!dayFilter || !parish.mass_times) return [];
    return parish.mass_times
      .filter((m) => m.day_of_week === dayFilter)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const dayChips = [
    { label: "Aujourd'hui", value: todayEn, highlight: true },
    ...DAY_ORDER.map((day) => ({ label: DAYS_FR[day], value: day })),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Navbar */}
      <nav className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all hover:scale-105"
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-xl">✝</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Rechercher une paroisse
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Trouvez votre paroisse
          </h2>
          <p className="text-gray-600 text-lg">
            Recherchez par nom de paroisse ou ville
          </p>
        </div>

        {/* Search Bar - Enhanced */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Nom de paroisse ou ville (ex: Cathédrale, Dakar, Saint-Joseph...)"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-14 pr-12 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            )}
          </div>

          {/* Day Filter Chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setDayFilter(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                dayFilter === null
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            {dayChips.map((chip) => (
              <button
                key={chip.label}
                onClick={() => setDayFilter(dayFilter === chip.value ? null : chip.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  dayFilter === chip.value
                    ? 'bg-primary-600 text-white shadow-md'
                    : chip.highlight
                      ? 'bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Search hint */}
          {!showResults && !dayFilter && (
            <p className="mt-4 text-sm text-gray-500 text-center">
              Commencez à taper pour voir les suggestions
            </p>
          )}
        </div>

        {/* Nearby Parish Search Button */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
              <span className="text-sm text-gray-600 font-medium">ou</span>
            </div>
          </div>
          <button
            onClick={handleFindNearby}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <MapPin className="w-5 h-5" />
            <span className="text-lg">Trouver les paroisses près de moi</span>
          </button>
          <p className="mt-3 text-sm text-gray-500 text-center">
            Utilise votre position pour trouver les paroisses dans un rayon de 10 km
          </p>
        </div>

        {/* Geolocation Error Display */}
        {geoError && (
          <div className="mb-8 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 shadow-md">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-yellow-900 font-semibold mb-1">Géolocalisation indisponible</p>
                <p className="text-yellow-800">{geoError}</p>
                <p className="text-yellow-700 text-sm mt-2">
                  Astuce: Vérifiez les paramètres de votre navigateur pour autoriser la géolocalisation
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 font-medium">Recherche en cours...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-red-800 shadow-md">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {!loading && showResults && filteredParishes.length === 0 && (searchQuery || dayFilter) && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-700 text-xl font-semibold mb-2">Aucune paroisse trouvée</p>
            <p className="text-gray-500 mb-6">
              {dayFilter ? `Aucune messe le ${DAYS_FR[dayFilter]?.toLowerCase() || dayFilter} pour cette recherche` : 'Essayez avec un autre nom de ville'}
            </p>
            <button
              onClick={() => { clearSearch(); setDayFilter(null); }}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Réinitialiser la recherche
            </button>
          </div>
        )}

        {!loading && filteredParishes.length > 0 && (
          <div>
            {/* Results count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600 font-medium">
                {userLocation && !searchQuery && (
                  <span className="inline-flex items-center gap-2 mr-2 text-primary-600">
                    <MapPin className="w-4 h-4" />
                  </span>
                )}
                <span className="text-primary-600 font-bold text-xl">{filteredParishes.length}</span>
                {' '}paroisse{filteredParishes.length > 1 ? 's' : ''} {userLocation && !searchQuery ? 'à proximité' : 'trouvée' + (filteredParishes.length > 1 ? 's' : '')}
                {dayFilter && (
                  <span className="text-gray-500 text-base ml-2">
                    ({DAYS_FR[dayFilter]})
                  </span>
                )}
              </p>
            </div>

            {/* Parish cards */}
            <div className="grid gap-6">
              {filteredParishes.map((parish) => {
                const matchingMasses = getMatchingMasses(parish);
                return (
                  <Link
                    key={parish.id}
                    to={`/parish/${parish.id}`}
                    className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-primary-200 transform hover:-translate-y-1"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Parish name */}
                          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                            {parish.name}
                          </h3>

                          {/* Location */}
                          <div className="space-y-2 text-gray-600">
                            <div className="flex items-start gap-3">
                              <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary-600" />
                              <span className="font-medium">
                                {parish.city}
                                {parish.region && parish.region !== parish.city && `, ${parish.region}`}
                              </span>
                            </div>

                            {parish.phone && (
                              <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 flex-shrink-0 text-primary-600" />
                                <span>{parish.phone}</span>
                              </div>
                            )}

                            {/* Show matching masses when day filter is active */}
                            {dayFilter && matchingMasses.length > 0 ? (
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="w-5 h-5 text-primary-600" />
                                  <span className="font-semibold text-primary-700">
                                    Messes du {DAYS_FR[dayFilter]} :
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2 ml-7">
                                  {matchingMasses.map((m) => (
                                    <span key={m.id} className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                                      {formatTime(m.time)}{m.language !== 'French' ? ` (${m.language})` : ''}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              parish.mass_times && parish.mass_times.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary-600" />
                                    <span className="font-semibold text-primary-700">
                                      {parish.mass_times.length} messe{parish.mass_times.length > 1 ? 's' : ''} par semaine
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        {/* Arrow icon */}
                        <div className="flex-shrink-0 ml-4">
                          <div className="w-10 h-10 rounded-full bg-primary-50 group-hover:bg-primary-600 flex items-center justify-center transition-colors">
                            <ChevronRight className="w-5 h-5 text-primary-600 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
