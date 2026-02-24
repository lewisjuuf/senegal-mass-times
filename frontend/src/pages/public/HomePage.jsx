import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Clock, Heart } from 'lucide-react';

/**
 * Public Home Page - Enhanced UI
 * Landing page for finding mass times in Senegal
 */
const HomePage = () => {
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
            Consultez facilement les horaires des messes catholiques dans toutes les paroisses
          </p>

          {/* CTA Search Button */}
          <Link
            to="/search"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl hover:from-primary-700 hover:to-primary-800 transition-all text-lg font-semibold shadow-2xl transform hover:scale-105 hover:shadow-primary-500/50"
          >
            <Search className="w-6 h-6" />
            Rechercher une paroisse
          </Link>
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
              Explorez toutes les paroisses catholiques à travers le Sénégal avec leurs informations complètes
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
                  15 paroisses à Dakar
                </span>{' '}
                avec leurs horaires de messes. D'autres diocèses seront ajoutés prochainement pour couvrir tout le Sénégal.
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
            <p className="text-gray-600">© 2024 Messes au Sénégal - Pour la communauté catholique</p>
            <div className="flex items-center gap-2 text-gray-500">
              <span>Fait avec</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>au Sénégal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
