import { Link } from 'react-router-dom'
import { FaUsers, FaFileAlt, FaCreditCard, FaUserPlus, FaGraduationCap, FaExclamationTriangle} from 'react-icons/fa'

function AdminDashboard() {
  const dashboardItems = [
    {
      title: 'Gestion des étudiants',
      description: 'Ajouter, modifier et gérer les dossiers des étudiants',
      path: '/admin/students',
      icon: FaUsers,
      color: 'bg-blue-500'
    },
    {
      title: 'Gestion des demandes',
      description: 'Revoir et traiter les demandes des étudiants',
      path: '/admin/requests',
      icon: FaFileAlt,
      color: 'bg-green-500'
    },
    {
      title: 'Gestion des paiements',
      description: 'Gérer les paiements et les frais des étudiants',
      path: '/admin/payments',
      icon: FaCreditCard,
      color: 'bg-yellow-500'
    },
    {
      title: 'Gestion des inscriptions',
      description: 'Gérer les inscriptions aux cours',
      path: '/admin/enrollments',
      icon: FaUserPlus,
      color: 'bg-purple-500'
    },
    {
      title: 'Gestion des notes',
      description: 'Saisir et gérer les notes des étudiants',
      path: '/admin/grades',
      icon: FaGraduationCap,
      color: 'bg-indigo-500'
    },
    {
      title: 'Gestion des reclamations',
      description: 'Gérer les reclamations des étudiants',
      path: '/admin/complaints',
      icon: FaExclamationTriangle,
      color: 'bg-red-500'
    }
  ]

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tableau de bord d'administration</h1>
          <p className="text-gray-600">Gérer tous les aspects du système de gestion scolaire</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
          {dashboardItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="block bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 "
            >
              <div className="p-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${item.color} text-white mb-4`}>
                  <item.icon className="text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
                <div className="mt-4 text-blue-600 text-sm font-medium">
                 Gérer →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard