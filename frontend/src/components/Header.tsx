import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaUser, FaSignOutAlt, FaTachometerAlt, FaUsers, FaFileAlt, FaCreditCard, FaUserPlus, FaChartBar, FaExclamationTriangle, FaGraduationCap, FaBars, FaTimes, FaChevronDown } from 'react-icons/fa'

interface HeaderProps {
  isAuthenticated: boolean
  onLogout: () => void
  userRole?: string | null
}

function Header({ isAuthenticated, onLogout, userRole }: HeaderProps) {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  const adminNavItems = [
    { path: '/admin', label: 'Tableau de bord', icon: FaTachometerAlt },
    { path: '/admin/students', label: 'Étudiants', icon: FaUsers },
    { path: '/admin/requests', label: 'Demandes', icon: FaFileAlt },
    { path: '/admin/payments', label: 'Paiements', icon: FaCreditCard },
    { path: '/admin/enrollments', label: 'Inscriptions', icon: FaUserPlus },
    { path: '/admin/grades', label: 'Notes', icon: FaGraduationCap },
    { path: '/admin/complaints', label: 'Réclamations', icon: FaExclamationTriangle },
  ]

  const studentNavItems = [
    { path: '/', label: 'Tableau de bord', icon: FaTachometerAlt },
    { path: '/profile', label: 'Profil', icon: FaUser },
    { path: '/grades', label: 'Notes', icon: FaGraduationCap },
    { path: '/requests', label: 'Demandes', icon: FaFileAlt },
    { path: '/payments', label: 'Paiements', icon: FaCreditCard },
    { path: '/enrollments', label: 'Inscriptions', icon: FaUserPlus },
    { path: '/complaints', label: 'Réclamations', icon: FaExclamationTriangle },
  ]

  const navItems = userRole === 'ADMIN' ? adminNavItems : studentNavItems

  return (
    <header className="relative" style={{ backgroundColor: '#1A1D29', boxShadow: '0 2px 10px rgba(26, 29, 41, 0.1)' }}>
      {/* Glow effect top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/50 to-transparent"></div>
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(125,132,145,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(177,178,181,0.08),transparent_50%)]"></div>
      
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        {/* Logo Container */}
        <div className="flex items-center">
          <Link 
            to={userRole === 'ADMIN' ? '/admin' : '/'} 
            className="group flex items-center gap-x-3 transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              {/* Glow effect behind logo */}
              <div className="absolute inset-0 rounded-xl" style={{ backgroundColor: 'rgba(125, 132, 145, 0.2)', filter: 'blur(16px)' }}></div>
              
              {/* Logo container */}
              <div className="relative flex items-center gap-x-3 rounded-xl px-4 py-2.5 backdrop-blur-sm border" style={{ backgroundColor: 'rgba(125, 132, 145, 0.2)', borderColor: 'rgba(125, 132, 145, 0.3)' }}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: '#3D3F4A' }}>
                  <FaGraduationCap className="text-lg text-white" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-base font-bold text-white tracking-tight">EnsaB</div>
                  <div className="text-[10px] font-medium -mt-0.5" style={{ color: '#B1B2B5' }}>Service de Scolarité</div>
                </div>
              </div>
            </div>
          </Link>
        </div>
        {/* Desktop Navigation - Centered */}
        {isAuthenticated && (
          <div className="hidden lg:flex lg:items-center lg:gap-x-2 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            {navItems.slice(0, 4).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group relative px-4 py-2 text-sm font-semibold transition-all duration-300 whitespace-nowrap rounded-lg"
                style={{ color: '#B1B2B5' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#B1B2B5'}
              >
                <span className="relative z-10">{item.label}</span>
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-teal-400/0 via-teal-400/10 to-teal-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            ))}
            {navItems.length > 4 && (
              <div className="relative group">
                <button className="flex items-center gap-x-1.5 px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg" style={{ color: '#B1B2B5' }}>
                  Plus
                  <FaChevronDown className="text-xs transition-transform duration-300 group-hover:rotate-180" />
                </button>
                <div className="absolute left-0 mt-2 w-56 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 backdrop-blur-xl" style={{ backgroundColor: '#1A1D29', borderColor: 'rgba(125, 132, 145, 0.3)', borderWidth: '1px' }}>
                  <div className="py-2">
                    {navItems.slice(4).map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center gap-x-3 px-4 py-2.5 text-sm transition-all duration-300"
                        style={{ color: '#B1B2B5' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#B1B2B5'}
                      >
                        <item.icon className="text-sm" style={{ color: '#7D8491' }} />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right side - Login/User */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-3">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-x-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(125, 132, 145, 0.2)', borderColor: 'rgba(125, 132, 145, 0.3)', borderWidth: '1px' }}>
                <div className="relative">
                  <div className="absolute inset-0 rounded-full" style={{ backgroundColor: 'rgba(125, 132, 145, 0.3)', filter: 'blur(8px)' }}></div>
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: '#3D3F4A' }}>
                    <FaUser className="text-xs text-white" />
                  </div>
                </div>
                <span className="text-xs font-medium" style={{ color: '#B1B2B5' }}>
                  {userRole === 'ADMIN' ? 'Admin' : 'Étudiant'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="group flex items-center gap-x-2 px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg"
                style={{ color: '#B1B2B5', borderColor: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FFFFFF'
                  e.currentTarget.style.borderColor = 'rgba(125, 132, 145, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#B1B2B5'
                  e.currentTarget.style.borderColor = 'transparent'
                }}
              >
                <span>Se déconnecter</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="group flex items-center gap-x-2 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 rounded-lg"
              style={{ backgroundColor: '#3D3F4A' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2D2F38'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3D3F4A'}
            >
              <span>Se connecter</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Glow effect bottom */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent"></div>
    </header>
  )
}

export default Header