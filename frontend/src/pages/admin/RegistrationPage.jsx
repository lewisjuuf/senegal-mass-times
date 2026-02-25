import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import authService from '../../services/authService';

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    region: '',
    address: '',
    phone: '',
    email: '',
    admin_email: '',
    admin_password: '',
    confirm_password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.admin_password !== formData.confirm_password) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (formData.admin_password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);

    try {
      const { confirm_password, ...registrationData } = formData;
      await authService.register(registrationData);
      setSuccess(true);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((e) => e.msg || e.message || JSON.stringify(e)).join('. '));
      } else {
        setError(detail || "Erreur lors de l'inscription. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Inscription envoyée !
            </h2>
            <p className="text-gray-600 mb-6">
              Votre demande d'inscription a été envoyée avec succès. L'administrateur
              principal examinera votre demande. Vous recevrez un email de confirmation
              une fois votre inscription approuvée.
            </p>
            <button
              onClick={() => navigate('/admin/login')}
              className="w-full px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-all"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <span className="text-white text-3xl">✝</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Inscrire votre paroisse
          </h1>
          <p className="text-gray-600">
            Créez un compte pour gérer les horaires de messe de votre paroisse
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Parish Info Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Informations de la paroisse
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la paroisse *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="ex: Paroisse Saint-Pierre"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Ville *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="ex: Dakar"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                      Quartier / Région
                    </label>
                    <input
                      type="text"
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="ex: Plateau"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="+221 33 XXX XX XX"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email public
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="contact@paroisse.sn"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Credentials Section */}
            <div className="pt-2 border-t">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 mt-3">
                Identifiants de connexion
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="admin_email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email administrateur *
                  </label>
                  <input
                    type="email"
                    id="admin_email"
                    name="admin_email"
                    value={formData.admin_email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="admin@paroisse.sn"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cet email sera utilisé pour vous connecter
                  </p>
                </div>

                <div>
                  <label htmlFor="admin_password" className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    id="admin_password"
                    name="admin_password"
                    value={formData.admin_password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Minimum 6 caractères"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le mot de passe *
                  </label>
                  <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Retapez votre mot de passe"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Inscription en cours...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>S'inscrire</span>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Déjà inscrit ?
            </p>
            <button
              onClick={() => navigate('/admin/login')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
