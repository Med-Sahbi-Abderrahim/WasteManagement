import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import clsx from 'clsx';

// Composants
import { CollectPointList } from '../components/PointsCollecte/CollectPointList';
import TourManagement from '../components/tournees/TourManagement';
import { StaffManagement } from '../components/employes/StaffManagement';
import VehicleList from '../components/vehicules/VehicleList';
import { ReportList } from '../components/ReportList';
import { CreateReport } from '../components/CreateReport';
import { CitizenHistory } from '../pages/citoyen/CitizenHistory';
import { ActivityReports } from '../components/ActivityReports';
import { AdminSettings } from '../components/AdminSettings';
import { AdminDashboard } from '../components/dashboards/AdminDashboard';
import { SupervisorDashboard } from '../components/dashboards/SupervisorDashboard';
import { TechnicianDashboard } from '../components/dashboards/TechnicianDashboard';
import { EmployeeDashboard } from '../components/dashboards/EmployeeDashboard';

// Icônes
import { LayoutDashboard, Map, Truck, Users, Settings, LogOut, History, AlertTriangle, FileText, Bell } from 'lucide-react';

// Store
import { useAuthStore } from '../store/authStore';

export const WasteDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Redirection si non connecté
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  // Items de navigation selon rôle
  const getNavItems = () => {
    const common = [{ icon: LayoutDashboard, label: 'Vue d\'ensemble', path: '/app' }];

    switch (user.role) {
      case 'ADMIN':
        return [
          ...common,
          { icon: Map, label: 'Points de Collecte', path: '/app/points' },
          { icon: Truck, label: 'Tournées', path: '/app/routes' },
          { icon: Users, label: 'Employés', path: '/app/staff' },
          { icon: Truck, label: 'Véhicules', path: '/app/vehicles' },
          { icon: AlertTriangle, label: 'Signalements', path: '/app/routes' },
          { icon: FileText, label: 'Rapports', path: '/app/activities' },
          { icon: Settings, label: 'Paramètres', path: '/app/settings' },
        ];
      case 'SUPERVISEUR':
        return [
          ...common,
          { icon: Truck, label: 'Suivi Tournées', path: '/app/routes' },
          { icon: Users, label: 'Coordination', path: '/app/staff' },
          { icon: Bell, label: 'Signalements', path: '/app/routes' },
          { icon: FileText, label: 'Rapports Activité', path: '/app/activities' },
        ];
      case 'TECHNICIEN':
        return [
          ...common,
          { icon: Truck, label: 'Mes Tournées', path: '/app/routes' },
          { icon: AlertTriangle, label: 'Signalements', path: '/app/reports' },
        ];
      case 'EMPLOYE':
        return [
          ...common,
          { icon: Truck, label: 'Mon planning', path: '/app/routes' },
        ];
      case 'CITOYEN':
        return [
          ...common,
          { icon: History, label: 'Historique', path: '/app/history' },
          { icon: AlertTriangle, label: 'Signaler', path: '/app/report' },
        ];
      default:
        return common;
    }
  };

  const navItems = getNavItems();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-blue-600';
      case 'SUPERVISEUR': return 'bg-purple-600';
      case 'TECHNICIEN': return 'bg-orange-500';
      case 'EMPLOYE': return 'bg-yellow-500';
      case 'CITOYEN': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={clsx(
              "w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold",
              getRoleColor(user.role)
            )}>
              {user.name.charAt(0)}
            </div>
            <span className="font-bold text-xl text-gray-900">EcoVille</span>
          </div>
          <div className="mt-2 px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600 inline-block">
            {user.role}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                location.pathname === item.path || (item.path === '/app' && location.pathname === '/app/')
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => { logout(); navigate('/'); }}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-30">
          <h1 className="text-xl font-semibold text-gray-800">
            {navItems.find(i => i.path === location.pathname)?.label || 'Tableau de bord'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-500 font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          <Routes>
            <Route path="/" element={
              user.role === 'ADMIN' ? <AdminDashboard /> : 
              user.role === 'SUPERVISEUR' ? <SupervisorDashboard /> :
              user.role === 'TECHNICIEN' ? <TechnicianDashboard /> :
              user.role === 'EMPLOYE' ? <EmployeeDashboard /> :
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">Bienvenue, {user.name}</h2>
                <p className="text-gray-500 mt-2">Sélectionnez une option dans le menu pour commencer.</p>
              </div>
            } />
            <Route path="/points" element={<CollectPointList />} />
            <Route path="/routes" element={user.role === 'EMPLOYE' ? <EmployeeDashboard /> : <TourManagement />} />
            <Route path="/staff" element={<StaffManagement />} />
            <Route path="/vehicles" element={<VehicleList />} />
            <Route path="/reports" element={<ReportList />} />
            <Route path="/activities" element={<ActivityReports />} />
            <Route path="/settings" element={<AdminSettings />} />
            <Route path="/report" element={<CreateReport />} />
            <Route path="/history" element={<CitizenHistory />} />
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                <Truck size={48} className="mb-4 opacity-20" />
                <p>Module en cours de développement</p>
              </div>
            } />
          </Routes>
        </div>
      </main>
    </div>
  );
};
