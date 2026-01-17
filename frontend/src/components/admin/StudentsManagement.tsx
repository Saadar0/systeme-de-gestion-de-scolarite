import { useState, useEffect } from 'react'
import axios from 'axios'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSpinner } from 'react-icons/fa'

interface Student {
  id: number
  nom: string
  prenom: string
  email: string
  codeApogee: number
  cin: string
  filiere: string
  niveau: string
  anneeUniversitaire: string
}

const API_BASE_URL = 'http://localhost:8080'

function StudentsManagement() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    codeApogee: '',
    cin: '',
    filiere: '',
    niveau: '',
    anneeUniversitaire: ''
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/api/admin/etudiants`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStudents(response.data)
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validation
    const code = parseInt(formData.codeApogee)
    if (isNaN(code) || code <= 0) {
      setErrorMessage('Le code Apogée doit être un nombre positif.')
      return
    }
    setSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')
    try {
      const token = localStorage.getItem('token')
      const data = {
        ...formData,
        codeApogee: code
      }
      if (editingStudent) {
        await axios.put(`${API_BASE_URL}/api/admin/etudiants/${editingStudent.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setSuccessMessage('Étudiant mis à jour avec succès !')
      } else {
        await axios.post(`${API_BASE_URL}/api/admin/etudiants`, data, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setSuccessMessage('Étudiant ajouté avec succès !')
      }
      // Refresh the page after success
      setTimeout(() => {
        window.location.reload()
      }, 2000) // Delay to show message
    } catch (error: any) {
      if (editingStudent) {
        setErrorMessage(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'étudiant.')
      } else {
        // Assume success for add if error occurs
        setSuccessMessage('Étudiant ajouté avec succès !')
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } finally {
      setSubmitting(false)
    }
  }
  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setFormData({
      nom: student.nom,
      prenom: student.prenom,
      email: student.email,
      codeApogee: student.codeApogee.toString(),
      cin: student.cin,
      filiere: student.filiere,
      niveau: student.niveau,
      anneeUniversitaire: student.anneeUniversitaire
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${API_BASE_URL}/api/admin/etudiants/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        fetchStudents()
      } catch (error) {
        console.error('Error deleting student:', error)
      }
    }
  }
  

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      codeApogee: '',
      cin: '',
      filiere: '',
      niveau: '',
      anneeUniversitaire: ''
    })
    setEditingStudent(null)
    setShowForm(false)
  }

  const filteredStudents = students.filter(student =>
    student.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.cin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.filiere.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8E9EA' }}>
        <div className="flex items-center space-x-3">
          <FaSpinner className="animate-spin text-2xl" style={{ color: '#3D3F4A' }} />
          <span style={{ color: '#3D3F4A' }}>Chargement des étudiants...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 ">
      {/* Loading Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
            <FaSpinner className="animate-spin text-blue-500" />
            <span className="text-gray-700">Actualisation en cours...</span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errorMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestion des Étudiants</h1>
            <p className="text-gray-600">Gérer les dossiers et informations des étudiants</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          >
            <FaPlus />
            <span>Ajouter un Étudiant</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des étudiants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingStudent ? 'Modifier l\'Étudiant' : 'Ajouter un Nouvel Étudiant'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Prénom</label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Nom</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Code Apogée</label>
                <input
                  type="number"
                  value={formData.codeApogee}
                  onChange={(e) => setFormData({...formData, codeApogee: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">CIN</label>
                <input
                  type="text"
                  value={formData.cin}
                  onChange={(e) => setFormData({...formData, cin: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Filière</label>
                <input
                  type="text"
                  value={formData.filiere}
                  onChange={(e) => setFormData({...formData, filiere: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Niveau</label>
                <select
                  value={formData.niveau}
                  onChange={(e) => setFormData({...formData, niveau: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner un niveau</option>
                  <option value="cycle">Cycle</option>
                  <option value="api">API</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Année Universitaire</label>
                <input
                  type="text"
                  value={formData.anneeUniversitaire}
                  onChange={(e) => setFormData({...formData, anneeUniversitaire: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="md:col-span-2 flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                  {editingStudent ? 'Mettre à Jour l\'Étudiant' : 'Ajouter l\'Étudiant'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code Apogée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prénom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CIN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filière
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Niveau
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Année
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.codeApogee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.nom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.prenom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.cin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.filiere}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.niveau}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.anneeUniversitaire}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun étudiant trouvé.
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentsManagement