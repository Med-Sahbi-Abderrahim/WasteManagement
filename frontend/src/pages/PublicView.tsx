import React, { Suspense, useEffect } from 'react';
import { useWasteStore } from '../store/wasteStore';
import type { PointCollecte } from '../types/waste';
import heroImage from '../assets/hero-ecoville.jpeg';
import {
  Info,
  MapPin,
  Recycle,
  Calendar,
  LogIn,
  ArrowRight,
  Leaf,
  Truck,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const WasteMap = React.lazy(() => import('../components/WasteMap.tsx'));

export const PublicView: React.FC = () => {
  const { points, fetchPoints } = useWasteStore();

  // Fetch points on mount
  useEffect(() => {
    console.log('[PublicView] Component mounted, fetching points...');
    fetchPoints();
  }, [fetchPoints]);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-500/20">
              <Leaf size={24} />
            </div>
            <div>
              <span className="block font-bold text-xl text-gray-900 leading-none">EcoVille</span>
              <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">Portail Citoyen</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
              <a href="#carte" className="hover:text-green-600 transition">Carte en direct</a>
              <Link to="/guide-tri" className="hover:text-green-600 transition">Guide du tri</Link>
              <Link to="/calendrier" className="hover:text-green-600 transition">Calendrier</Link>
            </nav>
            <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
            <Link
              to="/login"
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <LogIn size={18} />
              Espace Connecté
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${heroImage})` }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium">
              <Activity size={16} />
              <span>Système de gestion intelligent actif</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight leading-tight">
              Pour une ville plus propre et <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400">durable</span>.
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Accédez en temps réel à la carte des points de collecte, consultez les plannings de passage et participez activement à l'amélioration de notre environnement urbain.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <a href="#carte" className="px-8 py-4 bg-green-600 text-white rounded-full font-semibold hover:bg-green-500 transition-all shadow-lg shadow-green-900/20 flex items-center gap-2">
                <MapPin size={20} />
                Trouver un point de collecte
              </a>
              <Link to="/login" className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full font-semibold hover:bg-white/20 transition-all flex items-center gap-2">
                Signaler un incident
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl text-green-600"><MapPin size={24} /></div>
              <div><p className="text-2xl font-bold text-gray-900">{points.length}</p><p className="text-sm text-gray-500">Points de collecte</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Truck size={24} /></div>
              <div><p className="text-2xl font-bold text-gray-900">12</p><p className="text-sm text-gray-500">Véhicules actifs</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 rounded-xl text-orange-600"><Recycle size={24} /></div>
              <div><p className="text-2xl font-bold text-gray-900">85%</p><p className="text-sm text-gray-500">Taux de recyclage</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Calendar size={24} /></div>
              <div><p className="text-2xl font-bold text-gray-900">24/7</p><p className="text-sm text-gray-500">Service continu</p></div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION CARTE + LÉGENDE — CORRIGÉE (PLUS DE BLANC) */}
      <section id="carte" className="py-20 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Points de collecte en temps réel</h2>
            <p className="text-gray-600 mt-3">Cliquez sur un point pour voir son état de remplissage</p>
          </div>

          {/* Grille flexible avec hauteur 100% */}
          <div className="grid lg:grid-cols-4 gap-8 h-full min-h-0">
            {/* CARTE — Prend toute la hauteur disponible */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-96 md:h-[80vh] lg:h-full lg:min-h-0">
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-xl font-medium text-gray-700">Chargement de la carte...</p>
                    </div>
                  </div>
                }>
                  <WasteMap points={points as PointCollecte[]} />
                </Suspense>
              </div>
            </div>

            {/* LÉGENDE — Fixe à droite, sticky sur desktop */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24 max-h-screen overflow-y-auto">
                <h3 className="font-bold text-lg text-gray-900 mb-6">Légende & État</h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Niveau de remplissage</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-700">Disponible (0-50%)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                        <span className="text-sm text-gray-700">Moyennement plein (50-80%)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span className="text-sm text-gray-700">Critique (&gt;80%)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Types de déchets</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-600"></div><span>Verre</span></div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span>Plastique</span></div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600"></div><span>Papier</span></div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-600"></div><span>Organique</span></div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-4 flex items-start gap-2">
                      <AlertTriangle size={16} className="text-orange-500 mt-0.5" />
                      Vous constatez un problème sur un point de collecte ?
                    </p>
                    <Link
                      to="/login"
                      className="w-full bg-orange-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-orange-700 transition flex items-center justify-center gap-2 shadow-md"
                    >
                      Signaler un incident
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-4"><Recycle size={28} /></div>
              <h3 className="text-xl font-bold text-gray-900">Guide du Tri</h3>
              <p className="text-gray-600 leading-relaxed">Apprenez à trier efficacement vos déchets.</p>
              <Link to="/guide-tri" className="text-green-600 font-medium hover:underline inline-flex items-center gap-1">Guide complet <ArrowRight size={16} /></Link>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4"><Calendar size={28} /></div>
              <h3 className="text-xl font-bold text-gray-900">Planning de Collecte</h3>
              <p className="text-gray-600 leading-relaxed">Retrouvez les jours de passage dans votre quartier.</p>
              <Link to="/calendrier" className="text-blue-600 font-medium hover:underline inline-flex items-center gap-1">Voir le calendrier <ArrowRight size={16} /></Link>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-4"><Truck size={28} /></div>
              <h3 className="text-xl font-bold text-gray-900">Encombrants</h3>
              <p className="text-gray-600 leading-relaxed">Prenez rendez-vous pour l’enlèvement gratuit.</p>
              <Link to="/encombrants" className="text-purple-600 font-medium hover:underline inline-flex items-center gap-1">Prendre rendez-vous <ArrowRight size={16} /></Link>
            </div>
          </div>

          <div className="text-center mt-16">
            <Link to="/about" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition">
              <Info size={20} />
              En savoir plus sur EcoVille
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
              <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4 text-white">
                  <Leaf size={24} className="text-green-500" />
                  <span className="font-bold text-xl">EcoVille</span>
                </div>
                <p className="max-w-sm">
                  Plateforme municipale de gestion intelligente des déchets urbains. Ensemble, construisons une ville plus propre.
                </p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Liens Rapides</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white transition-colors">Accueil</a></li>
                  <li><a href="#carte" className="hover:text-white transition-colors">Carte</a></li>
                  <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
                  <li><Link to="/login" className="hover:text-white transition-colors">Connexion</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Contact</h4>
                <ul className="space-y-2">
                  <li>Mairie d'EcoVille</li>
                  <li>1 Place de l'Hôtel de Ville</li>
                  <li>contact@ecoville.fr</li>
                  <li>01 23 45 67 89</li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-gray-800 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
              <p>© 2025 EcoVille Smart City. Tous droits réservés.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-white">Mentions légales</a>
                <a href="#" className="hover:text-white">Confidentialité</a>
                <a href="#" className="hover:text-white">Accessibilité</a>
              </div>
            </div>
          </div>
        </footer>
    </div>
  );
};

export default PublicView;


