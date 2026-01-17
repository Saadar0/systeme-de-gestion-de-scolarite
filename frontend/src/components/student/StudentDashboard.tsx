import { Link } from 'react-router-dom'
import { FaUser, FaFileAlt, FaCreditCard, FaUserPlus, FaExclamationTriangle, FaGraduationCap } from 'react-icons/fa'

function StudentDashboard() {
  const dashboardItems = [
    {
      title: 'Mon profil',
      description: 'Consultez et mettez à jour vos informations personnelles',
      path: '/profile',
      icon: FaUser,
      color: 'bg-blue-500'
    },
    {
      title: 'Mes notes',
      description: 'Consultez votre performance académique',
      path: '/grades',
      icon: FaGraduationCap,
      color: 'bg-green-500'
    },
    {
      title: 'Mes demandes',
      description: 'Soumettre et suivre vos demandes',
      path: '/requests',
      icon: FaFileAlt,
      color: 'bg-yellow-500'
    },
    {
      title: 'Mes paiements',
      description: 'Consultez l\'historique et le statut de vos paiements',
      path: '/payments',
      icon: FaCreditCard,
      color: 'bg-purple-500'
    },
    {
      title: 'Mes inscriptions',
      description: 'Consultez vos inscriptions aux cours',
      path: '/enrollments',
      icon: FaUserPlus,
      color: 'bg-indigo-500'
    },
    {
      title: 'Mes réclamations',
      description: 'Soumettre et suivre vos réclamations',
      path: '/complaints',
      icon: FaExclamationTriangle,
      color: 'bg-red-500'
    }
  ]

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tableau de bord étudiant</h1>
          <p className="text-gray-600">Bienvenue dans votre portail de gestion académique</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="block bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${item.color} text-white mb-4`}>
                  <item.icon className="text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
                <div className="mt-4 text-blue-600 text-sm font-medium">
                  Afficher les détails →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard