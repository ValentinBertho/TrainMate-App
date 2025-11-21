import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Home, Calendar, BookOpen, User, Users, LogOut, Award } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation différente selon le rôle
  const isCoach = user?.role === 'Coach';

  const athleteLinks = [
    { to: '/dashboard', icon: Home, label: 'Accueil' },
    { to: '/calendar', icon: Calendar, label: 'Calendrier' },
    { to: '/plans', icon: BookOpen, label: 'Plans' },
    { to: '/groups', icon: Users, label: 'Groupes' },
    { to: '/coaches', icon: Award, label: 'Coachs' },
    { to: '/profile', icon: User, label: 'Profil' }
  ];

  const coachLinks = [
    { to: '/coach/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/coach/groups', icon: Users, label: 'Mes Groupes' },
    { to: '/my-groups', icon: Calendar, label: 'Mes Séances' },
    { to: '/coaches', icon: Award, label: 'Coachs' },
    { to: '/profile', icon: User, label: 'Profil' }
  ];

  const navLinks = isCoach ? coachLinks : athleteLinks;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">TrainMate</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Side Navigation (Desktop) */}
      <nav className="hidden sm:block fixed left-0 top-20 bottom-0 w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main Content - Avec marge à gauche sur desktop */}
      <main className="sm:ml-64 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 sm:hidden z-50">
        <div className="flex justify-around py-2">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center px-3 py-2 text-xs ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`
              }
            >
              <Icon size={24} />
              <span className="mt-1">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}