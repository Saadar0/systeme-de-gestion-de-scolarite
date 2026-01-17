import { useState, useEffect } from 'react'
import axios from 'axios'
import { FaPlus, FaSpinner, FaEye, FaExclamationTriangle, FaClock, FaCheckCircle, FaTimes } from 'react-icons/fa'

interface Complaint {
  id: number
  sujet: string
  message: string
  status: 'EN_ATTENTE' | 'TRAITEE'
  dateCreation: string
  dateTraitement: string | null
  reponse: string | null
  etudiant: {
    id: number
    nom: string
    prenom: string
    email: string
    codeApogee: string
  }
}

interface StudentProfile {
  email: string
  codeApogee: number
  cin: string
}

const API_BASE_URL = 'http://localhost:8080'

function StudentComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    sujet: '',
    message: ''
  })

  useEffect(() => {
    fetchProfile()
    fetchComplaints()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/api/etudiant/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProfile({
        email: response.data.email,
        codeApogee: response.data.codeApogee,
        cin: response.data.cin
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/api/etudiant/reclamations`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setComplaints(response.data)
    } catch (error) {
      console.error('Error fetching complaints:', error)
      setErrorMessage('Erreur lors du chargement des réclamations.')
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

    setSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')
    
    try {
      const token = localStorage.getItem('token')
      const requestData = {
        email: profile.email,
        codeApogee: profile.codeApogee,
        cin: profile.cin,
        sujet: formData.sujet,
        message: formData.message
      }

      await axios.post(`${API_BASE_URL}/api/etudiant/reclamations`, requestData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      setSuccessMessage('Réclamation créée avec succès !')
      fetchComplaints()
      resetForm()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      console.error('Error creating complaint:', error)
      setErrorMessage(error.response?.data?.message || 'Erreur lors de la création de la réclamation.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      sujet: '',
      message: ''
    })
    setShowForm(false)
  }

  const parseCustomDate = (dateString: string) => {
    if (!dateString) return null
    try {
      const [datePart] = dateString.split(' ')
      const [day, month, year] = datePart.split('-')
      return new Date(`${year}-${month}-${day}`)
    } catch (error) {
      return null
    }
  }

  const formatDateOnly = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = parseCustomDate(dateString)
    if (!date || isNaN(date.getTime())) return 'N/A'
    return date.toLocaleDateString('fr-FR')
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      EN_ATTENTE: { bg: '#FEF3C7', color: '#92400E', label: 'En Attente', icon: FaClock },
      TRAITEE: { bg: '#D1FAE5', color: '#065F46', label: 'Traitée', icon: FaCheckCircle }
    }
    const style = styles[status as keyof typeof styles] || styles.EN_ATTENTE
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
          <span style={{ color: '#3D3F4A' }}>Chargement...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 " style={{ backgroundColor: '#E8E9EA' }}>
      {submitting && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(26, 29, 41, 0.7)' }}>
          <div className="bg-white p-6 rounded-xl shadow-2xl flex items-center space-x-4">
            <FaSpinner className="animate-spin text-2xl" style={{ color: '#3D3F4A' }} />
            <span style={{ color: '#1A1D29' }}>Envoi en cours...</span>
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
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1A1D29' }}>Mes Réclamations</h1>
          <p style={{ color: '#7D8491' }}>Soumettre et suivre vos réclamations</p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            style={{ backgroundColor: '#3D3F4A', color: 'white' }}
          >
            <FaPlus />
            <span>Nouvelle Réclamation</span>
          </button>
        )}

        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A1D29' }}>
              Nouvelle Réclamation
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#1A1D29' }}>
                  Sujet *
                </label>
                <input
                  type="text"
                  value={formData.sujet}
                  onChange={(e) => setFormData({...formData, sujet: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: '#F5F5F6',
                    borderColor: '#D1D2D4',
                    color: '#1A1D29'
                  }}
                  placeholder="Ex: Problème avec mon inscription"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#1A1D29' }}>
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: '#F5F5F6',
                    borderColor: '#D1D2D4',
                    color: '#1A1D29'
                  }}
                  placeholder="Décrivez votre réclamation en détail..."
                  required
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                  style={{ backgroundColor: '#3D3F4A', color: 'white' }}
                >
                  Soumettre
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

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: '#F5F5F6' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Sujet
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#E8E9EA' }}>
                {complaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: '#FEE2E2' }}>
                          <FaExclamationTriangle style={{ color: '#991B1B' }} />
                        </div>
                        <div className="ml-4">
                          <div className="font-semibold" style={{ color: '#1A1D29' }}>
                            {complaint.sujet}
                          </div>
                          <div className="text-sm truncate max-w-md" style={{ color: '#7D8491' }}>
                            {complaint.message.substring(0, 60)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(complaint.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#7D8491' }}>
                      {formatDateOnly(complaint.dateCreation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedComplaint(complaint)
                          setShowDetailsModal(true)
                        }}
                        className="p-2 rounded-lg transition-all hover:bg-blue-50"
                        style={{ color: '#3B82F6' }}
                        title="Voir détails"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {complaints.length === 0 && (
            <div className="text-center py-12" style={{ color: '#7D8491' }}>
              <FaExclamationTriangle className="mx-auto text-5xl mb-4" />
              <p className="text-lg">Aucune réclamation trouvée.</p>
              <p className="text-sm mt-2">Cliquez sur "Nouvelle Réclamation" pour soumettre une réclamation.</p>
            </div>
          )}
        </div>
      </div>

      {showDetailsModal && selectedComplaint && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(26, 29, 41, 0.7)' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#1A1D29' }}>
                Détails de la Réclamation
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
                <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>SUJET</h3>
                <p className="font-semibold" style={{ color: '#1A1D29' }}>
                  {selectedComplaint.sujet}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>MESSAGE</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p style={{ color: '#1A1D29', whiteSpace: 'pre-wrap' }}>
                    {selectedComplaint.message}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>STATUT</h3>
                {getStatusBadge(selectedComplaint.status)}
              </div>

              <div>
                <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>DATE DE SOUMISSION</h3>
                <p style={{ color: '#1A1D29' }}>
                  {formatDateOnly(selectedComplaint.dateCreation)}
                </p>
              </div>

              {selectedComplaint.reponse && (
                <>
                  <div>
                    <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>RÉPONSE DE L'ADMINISTRATION</h3>
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <p style={{ color: '#1A1D29', whiteSpace: 'pre-wrap' }}>
                        {selectedComplaint.reponse}
                      </p>
                    </div>
                  </div>

                  {selectedComplaint.dateTraitement && (
                    <div>
                      <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>DATE DE TRAITEMENT</h3>
                      <p style={{ color: '#1A1D29' }}>
                        {formatDateOnly(selectedComplaint.dateTraitement)}
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end pt-4 border-t" style={{ borderColor: '#E8E9EA' }}>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                  style={{ backgroundColor: '#7D8491', color: 'white' }}
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

export default StudentComplaints