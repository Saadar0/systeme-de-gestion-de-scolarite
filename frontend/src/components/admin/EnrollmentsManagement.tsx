import { useState, useEffect } from 'react'
import axios from 'axios'
import { FaPlus, FaCheck, FaTimes, FaSearch, FaSpinner, FaEye, FaUserGraduate } from 'react-icons/fa'

interface Student {
  id: number
  nom: string
  prenom: string
  email: string
  codeApogee: number
  cin: string
  filiere: string
}

interface Enrollment {
  id: number
  typeInscription: 'MASTER' | 'DOCTORAT' | 'REINSC'
  status: 'ENREGISTRE' | 'CONFIRME' | 'ANNULE'
  anneeUniversitaire: string
  dateCreation: string
  dateConfirmation: string | null
  etudiant: {
    id: number
    nom: string
    prenom: string
    email: string
    codeApogee: number
  }
  admin: {
    id: number
    nom: string
    prenom: string
  } | null
}

const API_BASE_URL = 'http://localhost:8080'

function EnrollmentsManagement() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [showForm, setShowForm] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    etudiantId: '',
    typeInscription: 'MASTER' as 'MASTER' | 'DOCTORAT' | 'REINSC',
    anneeUniversitaire: ''
  })

  // Format date from backend format
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A'
    
    // Parse the date from backend format with time: "dd-MM-yyyy HH:mm:ss"
    const partsDateTime = dateStr.match(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/)
    
    if (partsDateTime) {
      const [, day, month, year, hour, minute, second] = partsDateTime
      const isoDate = `${year}-${month}-${day}T${hour}:${minute}:${second}`
      const date = new Date(isoDate)
      
      if (!isNaN(date.getTime())) {
        return date.toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      }
    }
    
    // Parse the date from backend format without time: "dd-MM-yyyy"
    const partsDateOnly = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/)
    
    if (partsDateOnly) {
      const [, day, month, year] = partsDateOnly
      const isoDate = `${year}-${month}-${day}`
      const date = new Date(isoDate)
      
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric'
        })
      }
    }
    
    // Fallback
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('fr-FR')
    }
    
    return dateStr
  }

  // Format date to show only date without time
  const formatDateOnly = (dateString: string) => {
    if (!dateString) return 'N/A'
    
    const partsDateTime = dateString.match(/(\d{2})-(\d{2})-(\d{4})/)
    
    if (partsDateTime) {
      const [, day, month, year] = partsDateTime
      const isoDate = `${year}-${month}-${day}`
      const date = new Date(isoDate)
      
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric'
        })
      }
    }
    
    return 'N/A'
  }

  useEffect(() => {
    fetchEnrollments()
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
      setErrorMessage('Erreur lors du chargement des étudiants.')
    }
  }

  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/api/admin/inscriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEnrollments(response.data)
    } catch (error) {
      console.error('Error fetching enrollments:', error)
      setErrorMessage('Erreur lors du chargement des inscriptions.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.etudiantId) {
      setErrorMessage('Veuillez sélectionner un étudiant.')
      return
    }
    
    setSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')
    
    try {
      const token = localStorage.getItem('token')
      const requestData = {
        etudiantId: parseInt(formData.etudiantId),
        typeInscription: formData.typeInscription,
        anneeUniversitaire: formData.anneeUniversitaire
      }

      await axios.post(`${API_BASE_URL}/api/admin/inscriptions`, requestData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      setSuccessMessage('Inscription créée avec succès !')
      fetchEnrollments()
      resetForm()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      console.error('Error creating enrollment:', error)
      setErrorMessage(error.response?.data?.message || 'Erreur lors de la création de l\'inscription.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirm = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir confirmer cette inscription ?')) {
      try {
        const token = localStorage.getItem('token')
        await axios.put(`${API_BASE_URL}/api/admin/inscriptions/${id}/confirm`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setSuccessMessage('Inscription confirmée avec succès !')
        fetchEnrollments()
        setTimeout(() => setSuccessMessage(''), 3000)
      } catch (error) {
        console.error('Error confirming enrollment:', error)
        setErrorMessage('Erreur lors de la confirmation de l\'inscription.')
      }
    }
  }

  const handleCancel = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette inscription ?')) {
      try {
        const token = localStorage.getItem('token')
        await axios.put(`${API_BASE_URL}/api/admin/inscriptions/${id}/cancel`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setSuccessMessage('Inscription annulée avec succès !')
        fetchEnrollments()
        setTimeout(() => setSuccessMessage(''), 3000)
      } catch (error) {
        console.error('Error canceling enrollment:', error)
        setErrorMessage('Erreur lors de l\'annulation de l\'inscription.')
      }
    }
  }

  const handleViewDetails = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment)
    setShowDetailsModal(true)
  }

  const resetForm = () => {
    setFormData({
      etudiantId: '',
      typeInscription: 'MASTER',
      anneeUniversitaire: ''
    })
    setShowForm(false)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      ENREGISTRE: { bg: '#FEF3C7', color: '#92400E', label: 'Enregistré' },
      CONFIRME: { bg: '#D1FAE5', color: '#065F46', label: 'Confirmé' },
      ANNULE: { bg: '#FEE2E2', color: '#991B1B', label: 'Annulé' }
    }
    const style = styles[status as keyof typeof styles] || styles.ENREGISTRE
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{
        backgroundColor: style.bg,
        color: style.color
      }}>
        {style.label}
      </span>
    )
  }

  const getTypeBadge = (type: string) => {
    const badges = {
      MASTER: { label: 'Master', bg: '#E0E7FF', color: '#3730A3' },
      DOCTORAT: { label: 'Doctorat', bg: '#EDE9FE', color: '#7C3AED' },
      REINSC: { label: 'Réinscription', bg: '#DBEAFE', color: '#1E40AF' }
    }
    const badge = badges[type as keyof typeof badges] || badges.MASTER
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{
        backgroundColor: badge.bg,
        color: badge.color
      }}>
        {badge.label}
      </span>
    )
  }

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = 
      enrollment.etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.etudiant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.etudiant.codeApogee.toString().includes(searchTerm) ||
      enrollment.anneeUniversitaire.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'ALL' || enrollment.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8E9EA' }}>
        <div className="flex items-center space-x-3">
          <FaSpinner className="animate-spin text-2xl" style={{ color: '#3D3F4A' }} />
          <span style={{ color: '#3D3F4A' }}>Chargement des inscriptions...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#E8E9EA' }}>
      {/* Loading Overlay */}
      {submitting && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(26, 29, 41, 0.7)', zIndex: 9999 }}>
          <div className="bg-white p-6 rounded-xl shadow-2xl flex items-center space-x-4">
            <FaSpinner className="animate-spin text-2xl" style={{ color: '#3D3F4A' }} />
            <span style={{ color: '#1A1D29' }}>Traitement en cours...</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl border shadow-lg animate-fade-in" style={{ 
            backgroundColor: '#D1FAE5',
            borderColor: '#6EE7B7',
            color: '#065F46'
          }}>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              {successMessage}
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl border shadow-lg" style={{ 
            backgroundColor: '#FEE2E2',
            borderColor: '#FCA5A5',
            color: '#991B1B'
          }}>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              {errorMessage}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1A1D29' }}>Gestion des Inscriptions</h1>
          <p style={{ color: '#7D8491' }}>Gérer les inscriptions des étudiants</p>
        </div>

        {/* Add Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            style={{ 
              backgroundColor: '#3D3F4A',
              color: 'white'
            }}
          >
            <FaPlus />
            <span>Nouvelle Inscription</span>
          </button>
        )}

        {/* Add Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A1D29' }}>
              Nouvelle Inscription
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2" style={{ color: '#1A1D29' }}>
                    Sélectionner un Étudiant *
                  </label>
                  <select
                    value={formData.etudiantId}
                    onChange={(e) => setFormData({...formData, etudiantId: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#F5F5F6',
                      borderColor: '#D1D2D4',
                      color: '#1A1D29'
                    }}
                    required
                  >
                    <option value="">-- Choisir un étudiant --</option>
                    {students.length === 0 ? (
                      <option disabled>Aucun étudiant disponible</option>
                    ) : (
                      students.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.prenom} {student.nom} - {student.codeApogee} - {student.email}
                        </option>
                      ))
                    )}
                  </select>
                  {students.length === 0 && (
                    <p className="mt-2 text-sm" style={{ color: '#EF4444' }}>
                      Aucun étudiant trouvé. Veuillez d'abord créer des étudiants dans la section "Students".
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#1A1D29' }}>
                    Type d'inscription *
                  </label>
                  <select
                    value={formData.typeInscription}
                    onChange={(e) => setFormData({...formData, typeInscription: e.target.value as any})}
                    className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#F5F5F6',
                      borderColor: '#D1D2D4',
                      color: '#1A1D29'
                    }}
                    required
                  >
                    <option value="MASTER">Master</option>
                    <option value="DOCTORAT">Doctorat</option>
                    <option value="REINSC">Réinscription</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#1A1D29' }}>
                    Année Universitaire *
                  </label>
                  <input
                    type="text"
                    value={formData.anneeUniversitaire}
                    onChange={(e) => setFormData({...formData, anneeUniversitaire: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#F5F5F6',
                      borderColor: '#D1D2D4',
                      color: '#1A1D29'
                    }}
                    placeholder="2024-2025"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                  style={{ 
                    backgroundColor: '#3D3F4A',
                    color: 'white'
                  }}
                >
                  Créer l'inscription
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                  style={{ 
                    backgroundColor: '#7D8491',
                    color: 'white'
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: '#7D8491' }} />
              <input
                type="text"
                placeholder="Rechercher par nom, email, code Apogée ou année..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: '#F5F5F6',
                  borderColor: '#D1D2D4',
                  color: '#1A1D29'
                }}
              />
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: '#F5F5F6',
                  borderColor: '#D1D2D4',
                  color: '#1A1D29'
                }}
              >
                <option value="ALL">Tous les statuts</option>
                <option value="ENREGISTRE">Enregistré</option>
                <option value="CONFIRME">Confirmé</option>
                <option value="ANNULE">Annulé</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enrollments Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: '#F5F5F6' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Étudiant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Année
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Date Création
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#E8E9EA' }}>
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: '#E0E7FF' }}>
                          <FaUserGraduate style={{ color: '#3730A3' }} />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium" style={{ color: '#1A1D29' }}>
                            {enrollment.etudiant.prenom} {enrollment.etudiant.nom}
                          </div>
                          <div className="text-sm" style={{ color: '#7D8491' }}>
                            {enrollment.etudiant.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(enrollment.typeInscription)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#3D3F4A' }}>
                      {enrollment.anneeUniversitaire}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(enrollment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#7D8491' }}>
                      {formatDateOnly(enrollment.dateCreation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(enrollment)}
                          className="p-2 rounded-lg transition-all hover:bg-blue-50"
                          style={{ color: '#3B82F6' }}
                          title="Voir détails"
                        >
                          <FaEye />
                        </button>
                        {enrollment.status === 'ENREGISTRE' && (
                          <>
                            <button
                              onClick={() => handleConfirm(enrollment.id)}
                              className="p-2 rounded-lg transition-all hover:bg-green-50"
                              style={{ color: '#10B981' }}
                              title="Confirmer"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => handleCancel(enrollment.id)}
                              className="p-2 rounded-lg transition-all hover:bg-red-50"
                              style={{ color: '#EF4444' }}
                              title="Annuler"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                        {enrollment.status === 'CONFIRME' && (
                          <button
                            onClick={() => handleCancel(enrollment.id)}
                            className="p-2 rounded-lg transition-all hover:bg-red-50"
                            style={{ color: '#EF4444' }}
                            title="Annuler"
                          >
                            <FaTimes />
                          </button>
                        )}
                        {enrollment.status === 'ANNULE' && (
                          <button
                            onClick={() => handleConfirm(enrollment.id)}
                            className="p-2 rounded-lg transition-all hover:bg-green-50"
                            style={{ color: '#10B981' }}
                            title="Confirmer"
                          >
                            <FaCheck />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEnrollments.length === 0 && (
            <div className="text-center py-12" style={{ color: '#7D8491' }}>
              <FaUserGraduate className="mx-auto text-5xl mb-4" />
              <p className="text-lg">Aucune inscription trouvée.</p>
              {searchTerm && (
                <p className="text-sm mt-2">Essayez de modifier vos critères de recherche.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedEnrollment && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(26, 29, 41, 0.7)', zIndex: 9999 }}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#1A1D29' }}>
                Détails de l'inscription
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 rounded-lg transition-all hover:bg-gray-100"
                style={{ color: '#7D8491' }}
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>ÉTUDIANT</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold" style={{ color: '#1A1D29' }}>
                    {selectedEnrollment.etudiant.prenom} {selectedEnrollment.etudiant.nom}
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#7D8491' }}>
                    Email: {selectedEnrollment.etudiant.email}
                  </p>
                  <p className="text-sm" style={{ color: '#7D8491' }}>
                    Code Apogée: {selectedEnrollment.etudiant.codeApogee}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>TYPE</h3>
                  {getTypeBadge(selectedEnrollment.typeInscription)}
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>STATUT</h3>
                  {getStatusBadge(selectedEnrollment.status)}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>ANNÉE UNIVERSITAIRE</h3>
                <p className="font-semibold" style={{ color: '#1A1D29' }}>
                  {selectedEnrollment.anneeUniversitaire}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>DATE DE CRÉATION</h3>
                  <p style={{ color: '#1A1D29' }}>
                    {formatDate(selectedEnrollment.dateCreation)}
                  </p>
                </div>
                {selectedEnrollment.dateConfirmation && (
                  <div>
                    <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>DATE DE CONFIRMATION</h3>
                    <p style={{ color: '#1A1D29' }}>
                      {formatDate(selectedEnrollment.dateConfirmation)}
                    </p>
                  </div>
                )}
              </div>

              {selectedEnrollment.admin && (
                <div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>TRAITÉ PAR</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-semibold" style={{ color: '#1A1D29' }}>
                      {selectedEnrollment.admin.prenom} {selectedEnrollment.admin.nom}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4 border-t" style={{ borderColor: '#E8E9EA' }}>
                {(selectedEnrollment.status === 'ENREGISTRE' || selectedEnrollment.status === 'ANNULE') && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      handleConfirm(selectedEnrollment.id)
                    }}
                    className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                    style={{ 
                      backgroundColor: '#10B981',
                      color: 'white'
                    }}
                  >
                    <FaCheck />
                    <span>Confirmer</span>
                  </button>
                )}
                {(selectedEnrollment.status === 'ENREGISTRE' || selectedEnrollment.status === 'CONFIRME') && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      handleCancel(selectedEnrollment.id)
                    }}
                    className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                    style={{ 
                      backgroundColor: '#EF4444',
                      color: 'white'
                    }}
                  >
                    <FaTimes />
                    <span>Annuler</span>
                  </button>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                  style={{ 
                    backgroundColor: '#7D8491',
                    color: 'white'
                  }}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnrollmentsManagement