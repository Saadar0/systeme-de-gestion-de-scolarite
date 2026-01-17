import { useState, useEffect } from 'react'
import axios from 'axios'
import { FaPlus, FaSearch, FaSpinner, FaEye, FaReply, FaExclamationTriangle, FaTimes, FaCheckCircle, FaClock, FaEdit } from 'react-icons/fa'

interface Student {
  id: number
  nom: string
  prenom: string
  email: string
  codeApogee: number
  cin: string
}

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
    codeApogee: number
  }
}

const API_BASE_URL = 'http://localhost:8080'

function ComplaintsManagement() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [showForm, setShowForm] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showTreatModal, setShowTreatModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    codeApogee: '',
    cin: '',
    sujet: '',
    message: ''
  })
  const [editData, setEditData] = useState({
    sujet: '',
    message: ''
  })
  const [treatmentResponse, setTreatmentResponse] = useState('')

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

  useEffect(() => {
    fetchComplaints()
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
    }
  }

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/api/admin/reclamations`, {
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
    setSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')
    
    try {
      const token = localStorage.getItem('token')
      const requestData = {
        email: formData.email,
        codeApogee: parseInt(formData.codeApogee),
        cin: formData.cin,
        sujet: formData.sujet,
        message: formData.message
      }

      await axios.post(`${API_BASE_URL}/api/admin/reclamations`, requestData, {
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

  const handleEdit = async () => {
    if (!selectedComplaint || !editData.sujet.trim() || !editData.message.trim()) {
      setErrorMessage('Veuillez remplir tous les champs.')
      return
    }

    setSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')
    
    try {
      const token = localStorage.getItem('token')
      const requestData = {
        sujet: editData.sujet,
        message: editData.message
      }

      await axios.put(`${API_BASE_URL}/api/admin/reclamations/${selectedComplaint.id}`, requestData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      setSuccessMessage('Réclamation modifiée avec succès !')
      fetchComplaints()
      setShowEditModal(false)
      setEditData({ sujet: '', message: '' })
      setSelectedComplaint(null)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      console.error('Error editing complaint:', error)
      setErrorMessage(error.response?.data?.message || 'Erreur lors de la modification de la réclamation.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleTreat = async () => {
    if (!selectedComplaint || !treatmentResponse.trim()) {
      setErrorMessage('Veuillez saisir une réponse.')
      return
    }

    setSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')
    
    try {
      const token = localStorage.getItem('token')
      const requestData = {
        reponse: treatmentResponse
      }

      await axios.put(`${API_BASE_URL}/api/admin/reclamations/${selectedComplaint.id}/treat`, requestData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      setSuccessMessage('Réclamation traitée avec succès !')
      fetchComplaints()
      setShowTreatModal(false)
      setTreatmentResponse('')
      setSelectedComplaint(null)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      console.error('Error treating complaint:', error)
      setErrorMessage(error.response?.data?.message || 'Erreur lors du traitement de la réclamation.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setShowDetailsModal(true)
  }

  const handleOpenEditModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setEditData({
      sujet: complaint.sujet,
      message: complaint.message
    })
    setShowEditModal(true)
  }

  const handleOpenTreatModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setTreatmentResponse('')
    setShowTreatModal(true)
  }

  const handleStudentSelect = (studentId: string) => {
    const student = students.find(s => s.id === parseInt(studentId))
    if (student) {
      setFormData({
        ...formData,
        email: student.email,
        codeApogee: student.codeApogee.toString(),
        cin: student.cin
      })
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      codeApogee: '',
      cin: '',
      sujet: '',
      message: ''
    })
    setShowForm(false)
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

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.etudiant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.sujet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.message.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'ALL' || complaint.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8E9EA' }}>
        <div className="flex items-center space-x-3">
          <FaSpinner className="animate-spin text-2xl" style={{ color: '#3D3F4A' }} />
          <span style={{ color: '#3D3F4A' }}>Chargement des réclamations...</span>
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
          <div className="mb-6 p-4 rounded-xl border shadow-lg animate-fade-in" style={{ 
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
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2" />
              {errorMessage}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1A1D29' }}>Gestion des Réclamations</h1>
          <p style={{ color: '#7D8491' }}>Gérer les réclamations des étudiants</p>
        </div>

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
            <span>Nouvelle Réclamation</span>
          </button>
        )}

        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A1D29' }}>
              Nouvelle Réclamation
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2" style={{ color: '#1A1D29' }}>
                    Sélectionner un Étudiant (optionnel)
                  </label>
                  <select
                    onChange={(e) => handleStudentSelect(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#F5F5F6',
                      borderColor: '#D1D2D4',
                      color: '#1A1D29'
                    }}
                  >
                    <option value="">-- Choisir un étudiant --</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.prenom} {student.nom} - {student.codeApogee} - {student.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#1A1D29' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#F5F5F6',
                      borderColor: '#D1D2D4',
                      color: '#1A1D29'
                    }}
                    placeholder="etudiant@ensab.ma"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#1A1D29' }}>
                    Code Apogée *
                  </label>
                  <input
                    type="number"
                    value={formData.codeApogee}
                    onChange={(e) => setFormData({...formData, codeApogee: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#F5F5F6',
                      borderColor: '#D1D2D4',
                      color: '#1A1D29'
                    }}
                    placeholder="12345678"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#1A1D29' }}>
                    CIN *
                  </label>
                  <input
                    type="text"
                    value={formData.cin}
                    onChange={(e) => setFormData({...formData, cin: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#F5F5F6',
                      borderColor: '#D1D2D4',
                      color: '#1A1D29'
                    }}
                    placeholder="AB123456"
                    required
                  />
                </div>

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
                    placeholder="Ex: Problème d'inscription"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2" style={{ color: '#1A1D29' }}>
                    Message *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#F5F5F6',
                      borderColor: '#D1D2D4',
                      color: '#1A1D29'
                    }}
                    placeholder="Décrivez votre réclamation..."
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
                  Créer la réclamation
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

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: '#7D8491' }} />
              <input
                type="text"
                placeholder="Rechercher par étudiant, sujet ou message..."
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
                <option value="EN_ATTENTE">En Attente</option>
                <option value="TRAITEE">Traitée</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: '#F5F5F6' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Étudiant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Sujet
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
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: '#FEE2E2' }}>
                          <FaExclamationTriangle style={{ color: '#991B1B' }} />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium" style={{ color: '#1A1D29' }}>
                            {complaint.etudiant.prenom} {complaint.etudiant.nom}
                          </div>
                          <div className="text-sm" style={{ color: '#7D8491' }}>
                            {complaint.etudiant.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate font-medium" style={{ color: '#1A1D29' }}>
                        {complaint.sujet}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(complaint.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#7D8491' }}>
                      {formatDateOnly(complaint.dateCreation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(complaint)}
                          className="p-2 rounded-lg transition-all hover:bg-blue-50"
                          style={{ color: '#3B82F6' }}
                          title="Voir détails"
                        >
                          <FaEye />
                        </button>
                        {complaint.status === 'EN_ATTENTE' && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(complaint)}
                              className="p-2 rounded-lg transition-all hover:bg-yellow-50"
                              style={{ color: '#F59E0B' }}
                              title="Modifier"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleOpenTreatModal(complaint)}
                              className="p-2 rounded-lg transition-all hover:bg-green-50"
                              style={{ color: '#10B981' }}
                              title="Traiter"
                            >
                              <FaReply />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredComplaints.length === 0 && (
            <div className="text-center py-12" style={{ color: '#7D8491' }}>
              <FaExclamationTriangle className="mx-auto text-5xl mb-4" />
              <p className="text-lg">Aucune réclamation trouvée.</p>
              {searchTerm && (
                <p className="text-sm mt-2">Essayez de modifier vos critères de recherche.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedComplaint && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(26, 29, 41, 0.7)', zIndex: 9999 }}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#1A1D29' }}>
                Détails de la réclamation
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
                    {selectedComplaint.etudiant.prenom} {selectedComplaint.etudiant.nom}
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#7D8491' }}>
                    Email: {selectedComplaint.etudiant.email}
                  </p>
                  <p className="text-sm" style={{ color: '#7D8491' }}>
                    Code Apogée: {selectedComplaint.etudiant.codeApogee}
                  </p>
                </div>
              </div>

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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>STATUT</h3>
                  {getStatusBadge(selectedComplaint.status)}
                </div>
                <div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>DATE DE CRÉATION</h3>
                  <p style={{ color: '#1A1D29' }}>
                    {formatDateOnly(selectedComplaint.dateCreation)}
                  </p>
                </div>
              </div>

              {selectedComplaint.reponse && (
                <>
                  <div>
                    <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>RÉPONSE</h3>
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
                        {formatDate(selectedComplaint.dateTraitement)}
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end space-x-4 pt-4 border-t" style={{ borderColor: '#E8E9EA' }}>
                {selectedComplaint.status === 'EN_ATTENTE' && (
                  <>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false)
                        handleOpenEditModal(selectedComplaint)
                      }}
                      className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                      style={{ 
                        backgroundColor: '#F59E0B',
                        color: 'white'
                      }}
                    >
                      <FaEdit />
                      <span>Modifier</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false)
                        handleOpenTreatModal(selectedComplaint)
                      }}
                      className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                      style={{ 
                        backgroundColor: '#10B981',
                        color: 'white'
                      }}
                    >
                      <FaReply />
                      <span>Traiter</span>
                    </button>
                  </>
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

      {/* Edit Modal */}
      {showEditModal && selectedComplaint && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(26, 29, 41, 0.7)', zIndex: 9999 }}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#1A1D29' }}>
                Modifier la réclamation
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditData({ sujet: '', message: '' })
                }}
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
                    {selectedComplaint.etudiant.prenom} {selectedComplaint.etudiant.nom}
                  </p>
                  <p className="text-sm" style={{ color: '#7D8491' }}>
                    {selectedComplaint.etudiant.email}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#1A1D29' }}>
                  Sujet *
                </label>
                <input
                  type="text"
                  value={editData.sujet}
                  onChange={(e) => setEditData({ ...editData, sujet: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: '#F5F5F6',
                    borderColor: '#D1D2D4',
                    color: '#1A1D29'
                  }}
                  placeholder="Sujet de la réclamation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#1A1D29' }}>
                  Message *
                </label>
                <textarea
                  value={editData.message}
                  onChange={(e) => setEditData({ ...editData, message: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: '#F5F5F6',
                    borderColor: '#D1D2D4',
                    color: '#1A1D29'
                  }}
                  placeholder="Message de la réclamation..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditData({ sujet: '', message: '' })
                  }}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                  style={{ 
                    backgroundColor: '#7D8491',
                    color: 'white'
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleEdit}
                  disabled={!editData.sujet.trim() || !editData.message.trim()}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-50"
                  style={{ 
                    backgroundColor: '#F59E0B',
                    color: 'white'
                  }}
                >
                  <FaCheckCircle />
                  <span>Enregistrer les modifications</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Treat Modal */}
      {showTreatModal && selectedComplaint && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(26, 29, 41, 0.7)', zIndex: 9999 }}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#1A1D29' }}>
                Traiter la réclamation
              </h2>
              <button
                onClick={() => {
                  setShowTreatModal(false)
                  setTreatmentResponse('')
                }}
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
                <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>MESSAGE DE L'ÉTUDIANT</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p style={{ color: '#1A1D29', whiteSpace: 'pre-wrap' }}>
                    {selectedComplaint.message}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#1A1D29' }}>
                  Votre Réponse *
                </label>
                <textarea
                  value={treatmentResponse}
                  onChange={(e) => setTreatmentResponse(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: '#F5F5F6',
                    borderColor: '#D1D2D4',
                    color: '#1A1D29'
                  }}
                  placeholder="Saisissez votre réponse à la réclamation..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowTreatModal(false)
                    setTreatmentResponse('')
                  }}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                  style={{ 
                    backgroundColor: '#7D8491',
                    color: 'white'
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleTreat}
                  disabled={!treatmentResponse.trim()}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-50"
                  style={{ 
                    backgroundColor: '#10B981',
                    color: 'white'
                  }}
                >
                  <FaCheckCircle />
                  <span>Envoyer la réponse</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ComplaintsManagement