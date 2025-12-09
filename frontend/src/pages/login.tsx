import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Leaf, ArrowLeft, User, Lock, AlertCircle, Info, Calendar, Clock, Map } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Login: React.FC = () => {
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();
  
  const [mail, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await login(mail, password);
    if (success) {
      navigate('/app');
    } else {
      setError('Identifiants incorrects. Veuillez réessayer.');
    }
  };

  const QuickLink = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <Link to={to} className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors group text-center">
      <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
        <Icon size={20} />
      </div>
      <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">{label}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-green-900/50">
            <Leaf size={40} />
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">Bienvenue sur EcoVille</h2>
          <p className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
            Plateforme intelligente de gestion des déchets urbains.
            Connectez-vous pour accéder à votre espace.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-24 bg-white">
        <div className="max-w-md mx-auto w-full">
          <div className="flex justify-between items-center mb-8">
            <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft size={16} className="mr-2" />
              Retour au portail
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Espace Connecté</h1>
            <p className="text-gray-500">Accédez à votre tableau de bord personnel.</p>
          </div>

      

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adresse e-mail</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={mail}
                  onChange={(e) => setMail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Se connecter
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Problème de connexion ? <Link to="/support" className="text-blue-600 font-medium hover:underline">Contacter le support</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
