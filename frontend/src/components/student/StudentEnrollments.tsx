import { useState, useEffect } from 'react'
import axios from 'axios'
import { FaSpinner, FaUserGraduate, FaCheckCircle, FaClock, FaTimesCircle, FaPlus } from 'react-icons/fa'

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
    codeApogee: string
  }
  admin: {
    id: number
    nom: string
    prenom: string
  } | null
}

interface StudentProfile {
  id: number
  email: string
  codeApogee: number
  cin: string
}

const API_BASE_URL = 'http://localhost:8080'

function StudentEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    typeInscription: 'REINSC' as 'MASTER' | 'DOCTORAT' | 'REINSC',
    anneeUniversitaire: ''
  })

  // Format date functions (copied from admin)
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A'
    
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
    
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('fr-FR')
    }
    
    return dateStr
  }

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

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A'
    return formatDate(dateString)
  }

  useEffect(() => {
    fetchProfile()
    fetchEnrollments()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/api/etudiant/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProfile({
        id: response.data.id,
        email: response.data.email,
        codeApogee: response.data.codeApogee,
        cin: response.data.cin
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      setErrorMessage('Erreur lors du chargement du profil.')
    }
  }

  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/api/etudiant/inscriptions`, {
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
    
    if (!profile) {
      setErrorMessage('Profil non chargé.')
      return
    }

    if (!formData.anneeUniversitaire.trim()) {
      setErrorMessage('Veuillez saisir l\'année universitaire.')
      return
    }

    setSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')
    
    try {
      const token = localStorage.getItem('token')
      const requestData = {
        etudiantId: profile.id,
        typeInscription: formData.typeInscription,
        anneeUniversitaire: formData.anneeUniversitaire
      }

      console.log('Sending request:', requestData) // Debug log

      await axios.post(`${API_BASE_URL}/api/etudiant/inscriptions`, requestData, {
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
      console.error('Error response:', error.response?.data) // Debug log
      setErrorMessage(error.response?.data?.message || 'Erreur lors de la création de l\'inscription.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      typeInscription: 'REINSC',
      anneeUniversitaire: ''
    })
    setShowForm(false)
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

  const getStatusBadge = (status: string) => {
    const styles = {
      ENREGISTRE: { bg: '#FEF3C7', color: '#92400E', label: 'Enregistré', icon: FaClock },
      CONFIRME: { bg: '#D1FAE5', color: '#065F46', label: 'Confirmé', icon: FaCheckCircle },
      ANNULE: { bg: '#FEE2E2', color: '#991B1B', label: 'Annulé', icon: FaTimesCircle }
    }
    const style = styles[status as keyof typeof styles] || styles.ENREGISTRE
    const Icon = style.icon
    return (
      <span className="inline-flex items-center gap-x-1 px-3 py-1 rounded-full text-xs font-semibold" style={{
        backgroundColor: style.bg,
        color: style.color
      }}>
        <Icon className="text-xs" />
        {style.label}
      </span>
    )
  }

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
      {submitting && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(26, 29, 41, 0.7)', zIndex: 9999 }}>
          <div className="bg-white p-6 rounded-xl shadow-2xl flex items-center space-x-4">
            <FaSpinner className="animate-spin text-2xl" style={{ color: '#3D3F4A' }} />
            <span style={{ color: '#1A1D29' }}>Traitement en cours...</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl border shadow-lg" style={{ 
            backgroundColor: '#D1FAE5',
            borderColor: '#6EE7B7',
            color: '#065F46'
          }}>
            <div className="flex items-center">
              <FaCheckCircle className="mr-2" />
              {successMessage}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl border shadow-lg" style={{ 
            backgroundColor: '#FEE2E2',
            borderColor: '#FCA5A5',
            color: '#991B1B'
          }}>
            {errorMessage}
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1A1D29' }}>Mes Inscriptions</h1>
          <p style={{ color: '#7D8491' }}>Gérer et consulter vos inscriptions</p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            style={{ backgroundColor: '#3D3F4A', color: 'white' }}
          >
            <FaPlus />
            <span>Nouvelle Inscription</span>
          </button>
        )}

        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A1D29' }}>
              Nouvelle Inscription
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#1A1D29' }}>
                    Type d'Inscription *
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
                    <option value="REINSC">Réinscription</option>
                    <option value="MASTER">Master</option>
                    <option value="DOCTORAT">Doctorat</option>
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
                    placeholder="Ex: 2024-2025"
                    required
                  />
                  <p className="mt-2 text-xs" style={{ color: '#7D8491' }}>
                    Format attendu: AAAA-AAAA (ex: 2024-2025)
                  </p>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                  style={{ backgroundColor: '#3D3F4A', color: 'white' }}
                >
                  Créer l'inscription
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                  style={{ backgroundColor: '#7D8491', color: 'white' }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#7D8491' }}>Total Inscriptions</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#1A1D29' }}>{enrollments.length}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: '#E0E7FF' }}>
                <FaUserGraduate className="text-2xl" style={{ color: '#3730A3' }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#7D8491' }}>Confirmées</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#10B981' }}>
                  {enrollments.filter(e => e.status === 'CONFIRME').length}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: '#D1FAE5' }}>
                <FaCheckCircle className="text-2xl" style={{ color: '#065F46' }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#7D8491' }}>En Attente</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#F59E0B' }}>
                  {enrollments.filter(e => e.status === 'ENREGISTRE').length}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: '#FEF3C7' }}>
                <FaClock className="text-2xl" style={{ color: '#92400E' }} />
              </div>
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
                    Type d'Inscription
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Année Universitaire
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Date d'Inscription
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Date de Confirmation / Annulation
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#E8E9EA' }}>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: '#E0E7FF' }}>
                          <FaUserGraduate style={{ color: '#3730A3' }} />
                        </div>
                        <div className="ml-4">
                          {getTypeBadge(enrollment.typeInscription)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold" style={{ color: '#1A1D29' }}>
                        {enrollment.anneeUniversitaire}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(enrollment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#7D8491' }}>
                      {formatDateOnly(enrollment.dateCreation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#7D8491' }}>
                      {enrollment.dateConfirmation ? formatDateTime(enrollment.dateConfirmation) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {enrollments.length === 0 && (
            <div className="text-center py-12" style={{ color: '#7D8491' }}>
              <FaUserGraduate className="mx-auto text-5xl mb-4" />
              <p className="text-lg">Aucune inscription trouvée.</p>
              <p className="text-sm mt-2">Cliquez sur "Nouvelle Inscription" pour créer votre première inscription.</p>
            </div>
          )}
        </div>

        {/* Timeline */}
        {enrollments.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A1D29' }}>
              Historique des Inscriptions
            </h2>
            <div className="space-y-6">
              {enrollments.map((enrollment, index) => (
                <div key={enrollment.id} className="flex items-start">
                  <div className="flex flex-col items-center mr-4">
                    <div 
                      className="flex items-center justify-center w-10 h-10 rounded-full"
                      style={{ 
                        backgroundColor: enrollment.status === 'CONFIRME' ? '#D1FAE5' : 
                                       enrollment.status === 'ANNULE' ? '#FEE2E2' : '#FEF3C7'
                      }}
                    >
                      {enrollment.status === 'CONFIRME' && <FaCheckCircle style={{ color: '#065F46' }} />}
                      {enrollment.status === 'ANNULE' && <FaTimesCircle style={{ color: '#991B1B' }} />}
                      {enrollment.status === 'ENREGISTRE' && <FaClock style={{ color: '#92400E' }} />}
                    </div>
                    {index < enrollments.length - 1 && (
                      <div className="w-0.5 h-full mt-2" style={{ backgroundColor: '#E8E9EA', minHeight: '40px' }} />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-x-3 mb-2">
                      {getTypeBadge(enrollment.typeInscription)}
                      <span className="font-semibold" style={{ color: '#1A1D29' }}>
                        {enrollment.anneeUniversitaire}
                      </span>
                    </div>
                    <p className="text-sm mb-1" style={{ color: '#7D8491' }}>
                      Inscrit le {formatDateOnly(enrollment.dateCreation)}
                    </p>
                    {enrollment.dateConfirmation && enrollment.status === 'CONFIRME' && (
                      <p className="text-sm" style={{ color: '#7D8491' }}>
                        Confirmé le {formatDateTime(enrollment.dateConfirmation)}
                      </p>
                    )}
                    {enrollment.dateConfirmation && enrollment.status === 'ANNULE' && (
                      <p className="text-sm" style={{ color: '#7D8491' }}>
                        Annulé le {formatDateTime(enrollment.dateConfirmation)}
                      </p>
                    )}
                    {enrollment.admin && (
                      <p className="text-xs mt-2" style={{ color: '#B1B2B5' }}>
                        Traité par: {enrollment.admin.prenom} {enrollment.admin.nom}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentEnrollments