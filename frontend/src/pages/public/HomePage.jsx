import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, Heart } from 'lucide-react';
import api from '../../services/api';
import parishService from '../../services/parishService';

/**
 * Public Home Page - Enhanced UI
 * Landing page for finding mass times in Senegal
 */
const HomePage = () => {
  const navigate = useNavigate();
  const [parishCount, setParishCount] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    api.get('/parishes')
      .then((res) => setParishCount(res.data.length))
      .catch(() => {});
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await parishService.getParishes({ city: query });
        setResults(data.slice(0, 5));
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <span className="text-white text-2xl">✝</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Messes au Sénégal
                </h1>
                <p className="text-xs text-gray-600">Trouvez votre paroisse</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-white text-4xl">✝</span>
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Trouvez les horaires des messes
            <br />
            <span className="text-primary-600">au Sénégal</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Consultez facilement les horaires des messes catholiques dans toutes les paroisses enregistrées sur la plateforme.
          </p>

          {/* Inline Search Bar */}
          <div className="max-w-2xl mx-auto relative" ref={dropdownRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher par nom ou ville (ex: Dakar, Cathédrale...)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => results.length > 0 && setShowDropdown(true)}
                  className="w-full pl-14 pr-4 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-xl"
                />
                {searchLoading && (
                  <div className="absolute inset-y-0 right-0 pr-5 flex items-center">
                    <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </form>

            {/* Dropdown Results */}
            {showDropdown && results.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                {results.map((parish) => (
                  <Link
                    key={parish.id}
                    to={`/parish/${parish.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-primary-50 transition-colors border-b border-gray-100 last:border-b-0"
                    onClick={() => setShowDropdown(false)}
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">{parish.name}</p>
                      <p className="text-sm text-gray-500">{parish.city}{parish.mass_times?.length ? ` · ${parish.mass_times.length} messe${parish.mass_times.length > 1 ? 's' : ''}` : ''}</p>
                    </div>
                  </Link>
                ))}
                <Link
                  to={`/search?q=${encodeURIComponent(query)}`}
                  className="block px-5 py-3 text-center text-primary-600 font-medium hover:bg-primary-50 transition-colors text-sm"
                  onClick={() => setShowDropdown(false)}
                >
                  Voir tous les résultats →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Features - Enhanced */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <MapPin className="w-7 h-7 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
              Toutes les paroisses
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Explorez les paroisses catholiques à travers le Sénégal
            </p>
          </div>

          <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Clock className="w-7 h-7 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
              Horaires à jour
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Consultez les horaires des messes mis à jour régulièrement par les paroisses
            </p>
          </div>

          <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Search className="w-7 h-7 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
              Recherche facile
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              Trouvez rapidement une paroisse près de chez vous par ville ou nom
            </p>
          </div>
        </div>

        {/* Info Note - Enhanced */}
        <div className="mt-20 bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-8 shadow-lg border border-primary-100">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                📍 Actuellement disponible
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                Cette plateforme référence actuellement{' '}
                <span className="font-bold text-primary-600 text-xl">
                  {parishCount !== null ? `${parishCount} paroisse${parishCount > 1 ? 's' : ''}` : 'des paroisses'}
                </span>{' '}
                au Sénégal avec leurs horaires de messes. De nouvelles paroisses sont ajoutées régulièrement.
              </p>
            </div>
          </div>
        </div>

        {/* Secondary CTA */}
        <div className="text-center mt-16">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-xl hover:bg-gray-50 transition-colors text-lg font-semibold shadow-lg border-2 border-primary-200 hover:border-primary-300"
          >
            Commencer la recherche
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600"> {new Date().getFullYear()} Messes au Sénégal - Pour la communauté catholique</p>

          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
