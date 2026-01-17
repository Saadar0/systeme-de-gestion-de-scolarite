import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { FaPlus, FaSearch, FaSpinner, FaCheck, FaTimes, FaFileInvoice, FaFilter } from 'react-icons/fa'

interface Student {
  id: number
  nom: string
  prenom: string
  email: string
  codeApogee: number | string
  cin: string
  filiere: string
  niveau: string
  anneeUniversitaire: string
}

interface EtudiantBasic {
  id: number
  nom: string
  prenom: string
  email: string
  codeApogee: number | string
  cin: string
  filiere: string
}

interface Paiement {
  id: number
  typePaiement: 'FRAIS_INSCRIPTION' | 'FRAIS_SCOLARITE' | 'ASSURANCE' | 'AUTRES'
  status: 'PAYE' | 'NON_PAYE' | 'EN_COURS'
  montant: number
  dateCreation: string
  datePaiement: string | null
  etudiant: EtudiantBasic
}

const API_BASE_URL = 'http://localhost:8080'

const TYPE_LABELS = {
  FRAIS_INSCRIPTION: 'Frais d\'inscription',
  FRAIS_SCOLARITE: 'Frais de scolarité',
  ASSURANCE: 'Assurance',
  AUTRES: 'Autres'
}

const STATUS_LABELS = {
  PAYE: 'Payé',
  NON_PAYE: 'Non payé',
  EN_COURS: 'En cours'
}

function PaymentsManagement() {
  const [students, setStudents] = useState<Student[]>([])
  const [paiements, setPaiements] = useState<Paiement[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [showForm, setShowForm] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [formData, setFormData] = useState({
    typePaiement: 'FRAIS_INSCRIPTION',
    montant: ''
  })

  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchStudents()
    fetchPaiements()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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

  const fetchPaiements = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/api/admin/paiements`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPaiements(response.data)
    } catch (error) {
      console.error('Error fetching paiements:', error)
      setErrorMessage('Erreur lors du chargement des paiements.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) {
      setErrorMessage('Veuillez sélectionner un étudiant.')
      return
    }
    
    const montant = parseFloat(formData.montant)
    if (isNaN(montant) || montant <= 0) {
      setErrorMessage('Le montant doit être un nombre positif.')
      return
    }

    setSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const token = localStorage.getItem('token')
      const requestData = {
        email: selectedStudent.email,
        codeApogee: typeof selectedStudent.codeApogee === 'string' 
          ? parseInt(selectedStudent.codeApogee) 
          : selectedStudent.codeApogee,
        cin: selectedStudent.cin,
        typePaiement: formData.typePaiement,
        montant: montant
      }

      await axios.post(`${API_BASE_URL}/api/admin/paiements`, requestData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      setSuccessMessage('Paiement créé avec succès !')
      fetchPaiements()
      resetForm()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      console.error('Error creating paiement:', error)
      setErrorMessage(error.response?.data?.message || 'Erreur lors de la création du paiement.')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePayPaiement = async (id: number) => {
    if (window.confirm('Confirmer le paiement ?')) {
      try {
        const token = localStorage.getItem('token')
        await axios.put(`${API_BASE_URL}/api/admin/paiements/${id}/pay`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setSuccessMessage('Paiement marqué comme payé !')
        fetchPaiements()
        setTimeout(() => setSuccessMessage(''), 3000)
      } catch (error) {
        console.error('Error paying paiement:', error)
        setErrorMessage('Erreur lors de la mise à jour du paiement.')
      }
    }
  }

  const handleCancelPaiement = async (id: number) => {
    const paiement = paiements.find(p => p.id === id)
    const message = paiement?.status === 'PAYE' 
      ? 'Êtes-vous sûr de vouloir annuler ce paiement déjà payé ?' 
      : 'Êtes-vous sûr de vouloir annuler ce paiement ?'
    
    if (window.confirm(message)) {
      try {
        const token = localStorage.getItem('token')
        await axios.put(`${API_BASE_URL}/api/admin/paiements/${id}/cancel`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setSuccessMessage('Paiement annulé !')
        fetchPaiements()
        setTimeout(() => setSuccessMessage(''), 3000)
      } catch (error) {
        console.error('Error cancelling paiement:', error)
        setErrorMessage('Erreur lors de l\'annulation du paiement.')
      }
    }
  }

  const generateReceipt = async (paiement: Paiement) => {
    try {
      // Validate that we have all necessary data
      if (!paiement || !paiement.etudiant) {
        throw new Error('Données du paiement incomplètes')
      }

      // Dynamic import of jsPDF
      const { default: jsPDF } = await import('jspdf')
      
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      
      // Helper function to load image as base64
      const loadImageAsBase64 = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = 'Anonymous'
          img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            ctx?.drawImage(img, 0, 0)
            resolve(canvas.toDataURL('image/png'))
          }
          img.onerror = reject
          img.src = url
        })
      }
      
      // Add logos at the top
      try {
        // Left logo - Smaller size
        const leftLogoData = await loadImageAsBase64('/ensa.png')
        doc.addImage(leftLogoData, 'PNG', 15, 10, 35, 20)
      } catch (error) {
        console.warn('Could not load left logo:', error)
        // Fallback to placeholder
        doc.setFillColor(26, 29, 41)
        doc.roundedRect(15, 10, 35, 20, 2, 2, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.text('ENSA', 32.5, 18, { align: 'center' })
        doc.text('LOGO', 32.5, 23, { align: 'center' })
      }
      
      try {
        // Right logo - Smaller size
        const rightLogoData = await loadImageAsBase64('/uh1.png')
        doc.addImage(rightLogoData, 'PNG', pageWidth - 50, 10, 30, 25)
      } catch (error) {
        console.warn('Could not load right logo:', error)
        // Fallback to placeholder
        doc.setFillColor(26, 29, 41)
        doc.roundedRect(pageWidth - 50, 10, 35, 20, 2, 2, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.text('ENSA', pageWidth - 32.5, 18, { align: 'center' })
        doc.text('LOGO', pageWidth - 32.5, 23, { align: 'center' })
      }
      
      // Main title "REÇU DE PAIEMENT" centered below logos
      doc.setTextColor(220, 53, 69)
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text('REÇU DE PAIEMENT', pageWidth / 2, 45, { align: 'center' })
      
      // DÉTAIL DE PAIEMENT section
      let yPos = 60
      doc.setFillColor(248, 250, 252)
      doc.rect(15, yPos, pageWidth - 30, 10, 'F')
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('DÉTAIL DE PAIEMENT', 17, yPos + 6)
      
      yPos += 15
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      
      const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'N/A'
        
        // Parse the date from backend format: "dd-MM-yyyy"
        const partsDateOnly = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/)
        
        if (partsDateOnly) {
          // parts: [full, day, month, year]
          const [, day, month, year] = partsDateOnly
          // Create date in ISO format: yyyy-MM-dd
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
        
        // Parse the date from backend format with time: "dd-MM-yyyy HH:mm:ss"
        const partsDateTime = dateStr.match(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/)
        
        if (partsDateTime) {
          // parts: [full, day, month, year, hour, minute, second]
          const [, day, month, year, hour, minute, second] = partsDateTime
          // Create date in ISO format: yyyy-MM-ddTHH:mm:ss
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
        
        // Fallback: try to parse as ISO date
        const date = new Date(dateStr)
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
          })
        }
        
        return dateStr // Return as is if parsing fails
      }
      
      const detailPaiement = [
        ['Date de paiement', ':', paiement.datePaiement ? formatDate(paiement.datePaiement) : formatDate(paiement.dateCreation)],
        ['N° de paiement', ':', (paiement.id || 'N/A').toString()],
        ['Méthode de paiement', ':', 'ESPÈCES/VIREMENT'],
        ['Statut', ':', STATUS_LABELS[paiement.status] || 'N/A']
      ]
      
      detailPaiement.forEach(([label, colon, value]) => {
        doc.setFont('helvetica', 'normal')
        doc.text(label, 20, yPos)
        doc.text(colon, 75, yPos)
        doc.setFont('helvetica', 'bold')
        doc.text(value, 80, yPos)
        yPos += 7
      })
      
      // DÉTAIL DE LA COMMANDE section
      yPos += 5
      doc.setFillColor(248, 250, 252)
      doc.rect(15, yPos, pageWidth - 30, 10, 'F')
      doc.setFont('helvetica', 'bold')
      doc.text('DÉTAIL DE LA COMMANDE', 17, yPos + 6)
      
      yPos += 15
      doc.setFont('helvetica', 'normal')
      doc.text('Montant', 20, yPos)
      doc.text(':', 75, yPos)
      doc.setFont('helvetica', 'bold')
      doc.text(`${(paiement.montant || 0).toFixed(2)} MAD`, 80, yPos)
      
      yPos += 7
      doc.setFont('helvetica', 'normal')
      doc.text('Type', 20, yPos)
      doc.text(':', 75, yPos)
      doc.setFont('helvetica', 'bold')
      doc.text(TYPE_LABELS[paiement.typePaiement] || 'N/A', 80, yPos)
      
      // INFORMATIONS DE L'ÉTUDIANT section
      yPos += 10
      doc.setFillColor(248, 250, 252)
      doc.rect(15, yPos, pageWidth - 30, 10, 'F')
      doc.setFont('helvetica', 'bold')
      doc.text('INFORMATIONS DE L\'ÉTUDIANT', 17, yPos + 6)
      
      yPos += 15
      doc.setFont('helvetica', 'normal')
      
      const infoClient = [
        ['Nom', ':', `${paiement.etudiant?.prenom || 'N/A'} ${paiement.etudiant?.nom || 'N/A'}`],
        ['Code Apogée', ':', (paiement.etudiant?.codeApogee || 'N/A').toString()],
        ['CIN', ':', paiement.etudiant?.cin || 'N/A'],
        ['Filière', ':', paiement.etudiant?.filiere || 'N/A'],
        ['E-mail', ':', paiement.etudiant?.email || 'N/A']
      ]
      
      infoClient.forEach(([label, colon, value]) => {
        doc.setFont('helvetica', 'normal')
        doc.text(label, 20, yPos)
        doc.text(colon, 75, yPos)
        doc.setFont('helvetica', 'bold')
        doc.text(value, 80, yPos)
        yPos += 7
      })
      
      // DÉTAIL ÉTABLISSEMENT section
      yPos += 5
      doc.setFillColor(248, 250, 252)
      doc.rect(15, yPos, pageWidth - 30, 10, 'F')
      doc.setFont('helvetica', 'bold')
      doc.text('DÉTAIL ÉTABLISSEMENT', 17, yPos + 6)
      
      yPos += 15
      doc.setFont('helvetica', 'normal')
      doc.text('Nom de l\'établissement', 20, yPos)
      doc.text(':', 75, yPos)
      doc.setFont('helvetica', 'bold')
      doc.text('ENSA BERRECHID', 80, yPos)
      
      yPos += 7
      doc.setFont('helvetica', 'normal')
      doc.text('Adresse', 20, yPos)
      doc.text(':', 75, yPos)
      doc.setFont('helvetica', 'bold')
      const address = 'Avenue de l\'Université, BP 218 Berrechid'
      doc.text(address, 80, yPos)
      
      // Footer
      yPos = doc.internal.pageSize.getHeight() - 20
      doc.setDrawColor(220, 220, 220)
      doc.line(15, yPos, pageWidth - 15, yPos)
      
      yPos += 7
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text('École Nationale des Sciences Appliquées de Berrechid', pageWidth / 2, yPos, { align: 'center' })
      yPos += 4
      doc.text('Ce document est généré automatiquement et ne nécessite pas de signature', pageWidth / 2, yPos, { align: 'center' })
      
      // Save the PDF
      const fileName = `Recu_Paiement_${paiement.id || 'N/A'}_${paiement.etudiant?.nom || 'Etudiant'}.pdf`
      doc.save(fileName)
      
      setSuccessMessage('Reçu téléchargé avec succès !')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error generating PDF:', error)
      setErrorMessage('Erreur lors de la génération du reçu.')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const formatDateDisplay = (dateStr: string | null) => {
    if (!dateStr) return 'Invalid Date'
    
    // Parse the date from backend format: "dd-MM-yyyy"
    const parts = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/)
    
    if (parts) {
      const [, day, month, year] = parts
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
    
    return 'Invalid Date'
  }

  const resetForm = () => {
    setFormData({
      typePaiement: 'FRAIS_INSCRIPTION',
      montant: ''
    })
    setSelectedStudent(null)
    setSearchInput('')
    setShowForm(false)
  }

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value)
    setShowSuggestions(value.length > 0)
  }

  const handleSuggestionClick = (student: Student) => {
    setSelectedStudent(student)
    setSearchInput(`${student.prenom} ${student.nom}`)
    setShowSuggestions(false)
  }

    const getSuggestions = () => {
    if (!searchInput.trim()) return []
    return students.filter(student =>
      student.nom.toLowerCase().includes(searchInput.toLowerCase()) ||
      student.prenom.toLowerCase().includes(searchInput.toLowerCase()) ||
      student.codeApogee.toString().includes(searchInput)
    ).slice(0, 5)
  }

  const filteredPaiements = paiements.filter(paiement => {
    const matchesSearch = 
      paiement.etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paiement.etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paiement.etudiant.codeApogee.toString().includes(searchTerm) ||
      paiement.id.toString().includes(searchTerm)
    
    const matchesStatus = statusFilter === 'ALL' || paiement.status === statusFilter
    const matchesType = typeFilter === 'ALL' || paiement.typePaiement === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const suggestions = getSuggestions()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8E9EA' }}>
        <div className="flex items-center space-x-3">
          <FaSpinner className="animate-spin text-2xl" style={{ color: '#3D3F4A' }} />
          <span style={{ color: '#3D3F4A' }}>Chargement des paiements...</span>
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
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
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
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              {errorMessage}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1A1D29' }}>Gestion des Paiements</h1>
          <p style={{ color: '#7D8491' }}>Gérer les paiements des étudiants</p>
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
            <span>Créer un Paiement</span>
          </button>
        )}

        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A1D29' }}>
              Créer un Nouveau Paiement
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-3" style={{ color: '#1A1D29' }}>
                  Sélectionner un Étudiant *
                </label>
                <div ref={searchRef} className="relative">
                  <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: '#7D8491' }} />
                    <input
                      type="text"
                      placeholder="Rechercher par nom, prénom ou code Apogée..."
                      value={searchInput}
                      onChange={(e) => handleSearchInputChange(e.target.value)}
                      onFocus={() => setShowSuggestions(searchInput.length > 0)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: '#F5F5F6',
                        borderColor: '#D1D2D4',
                        color: '#1A1D29'
                      }}
                    />
                  </div>

                  {showSuggestions && suggestions.length > 0 && (
                    <div 
                      className="absolute z-10 w-full mt-2 rounded-xl shadow-2xl border overflow-hidden"
                      style={{ 
                        backgroundColor: 'white',
                        borderColor: '#D1D2D4',
                        maxHeight: '300px',
                        overflowY: 'auto'
                      }}
                    >
                      {suggestions.map((student) => (
                        <div
                          key={student.id}
                          onClick={() => handleSuggestionClick(student)}
                          className="px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 border-b last:border-b-0"
                          style={{ borderColor: '#E8E9EA' }}
                        >
                          <div className="font-semibold" style={{ color: '#1A1D29' }}>
                            {student.prenom} {student.nom}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#1A1D29' }}>
                    Type de Paiement *
                  </label>
                  <select
                    value={formData.typePaiement}
                    onChange={(e) => setFormData({...formData, typePaiement: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#F5F5F6',
                      borderColor: '#D1D2D4',
                      color: '#1A1D29'
                    }}
                    required
                  >
                    <option value="FRAIS_INSCRIPTION">Frais d'inscription</option>
                    <option value="FRAIS_SCOLARITE">Frais de scolarité</option>
                    <option value="ASSURANCE">Assurance</option>
                    <option value="AUTRES">Autres</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#1A1D29' }}>
                    Montant (DH) *
                  </label>
                  <input
                    type="number"
                    value={formData.montant}
                    onChange={(e) => setFormData({...formData, montant: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#F5F5F6',
                      borderColor: '#D1D2D4',
                      color: '#1A1D29'
                    }}
                    placeholder="Ex: 5000"
                    min="0.01"
                    step="0.01"
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
                  Créer le Paiement
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
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: '#7D8491' }} />
              <input
                type="text"
                placeholder="Rechercher par étudiant, code Apogée ou N° paiement..."
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
            <div className="flex gap-4">
              <div className="relative">
                <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: '#7D8491' }} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-11 pr-8 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: '#F5F5F6',
                    borderColor: '#D1D2D4',
                    color: '#1A1D29'
                  }}
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="PAYE">Payé</option>
                  <option value="NON_PAYE">Non payé</option>
                  <option value="EN_COURS">En cours</option>
                </select>
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                style={{ 
                  backgroundColor: '#F5F5F6',
                  borderColor: '#D1D2D4',
                  color: '#1A1D29'
                }}
              >
                <option value="ALL">Tous les types</option>
                <option value="FRAIS_INSCRIPTION">Frais d'inscription</option>
                <option value="FRAIS_SCOLARITE">Frais de scolarité</option>
                <option value="ASSURANCE">Assurance</option>
                <option value="AUTRES">Autres</option>
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
                    N° Paiement
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Étudiant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Montant
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
                {filteredPaiements.map((paiement) => (
                  <tr key={paiement.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium" style={{ color: '#1A1D29' }}>
                      #{paiement.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#3D3F4A' }}>
                      <div>
                        <div className="font-semibold">{paiement.etudiant.prenom} {paiement.etudiant.nom}</div>
                        <div className="text-sm" style={{ color: '#7D8491' }}>Code: {paiement.etudiant.codeApogee}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#3D3F4A' }}>
                      {TYPE_LABELS[paiement.typePaiement]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold" style={{ color: '#1A1D29' }}>
                      {paiement.montant.toFixed(2)} DH
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold" style={{
                        backgroundColor: paiement.status === 'PAYE' ? '#D1FAE5' : paiement.status === 'NON_PAYE' ? '#FEE2E2' : '#FEF3C7',
                        color: paiement.status === 'PAYE' ? '#065F46' : paiement.status === 'NON_PAYE' ? '#991B1B' : '#92400E'
                      }}>
                        {STATUS_LABELS[paiement.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#7D8491' }}>
                      {formatDateDisplay(paiement.dateCreation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {(paiement.status === 'NON_PAYE' || paiement.status === 'EN_COURS') && (
                          <button
                            onClick={() => handlePayPaiement(paiement.id)}
                            className="p-2 rounded-lg transition-all hover:bg-green-50"
                            style={{ color: '#10B981' }}
                            title="Marquer comme payé"
                          >
                            <FaCheck />
                          </button>
                        )}
                        {(paiement.status === 'PAYE' || paiement.status === 'NON_PAYE') && (
                          <button
                            onClick={() => handleCancelPaiement(paiement.id)}
                            className="p-2 rounded-lg transition-all hover:bg-red-50"
                            style={{ color: '#EF4444' }}
                            title={paiement.status === 'PAYE' ? 'Annuler le paiement' : 'Annuler'}
                          >
                            <FaTimes />
                          </button>
                        )}
                        <button
                          onClick={() => generateReceipt(paiement)}
                          className="p-2 rounded-lg transition-all hover:bg-blue-50"
                          style={{ color: '#3B82F6' }}
                          title="Générer reçu"
                        >
                          <FaFileInvoice />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPaiements.length === 0 && (
            <div className="text-center py-12" style={{ color: '#7D8491' }}>
              <p className="text-lg">Aucun paiement trouvé.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentsManagement