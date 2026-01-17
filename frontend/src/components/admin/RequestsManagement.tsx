import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { FaPlus, FaCheck, FaTimes, FaSearch, FaSpinner, FaFileAlt, FaDownload } from 'react-icons/fa'

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

interface AdminBasic {
  id: number
  nom: string
  prenom: string
}

interface Demande {
  id: number
  typeDocument: 'ATTESTATION_SCOLARITE' | 'RELEVE_NOTES' | 'CONVENTION_DE_STAGE'  
  status: 'EN_ATTENTE' | 'APPROVEE' | 'REFUSEE'
  dateCreation: string
  dateTraitement: string | null
  etudiant: EtudiantBasic
  admin: AdminBasic | null
  asyncErrorMessage: string | null
}

interface Note {
  id: number
  module: string
  valeur: number
  etudiantId: number
}

const API_BASE_URL = 'http://localhost:8080'

const TYPE_LABELS = {
  ATTESTATION_SCOLARITE: 'Attestation de scolarité',
  RELEVE_NOTES: 'Relevé de notes',
  CONVENTION_DE_STAGE: 'Convention de stage',
  CARTE_ETUDIANT: 'Carte étudiant'
}

const STATUS_LABELS = {
  EN_ATTENTE: 'En attente',
  EN_COURS: 'En cours',
  APPROVEE: 'Approuvée',
  REFUSEE: 'Refusée'
}

function RequestsManagement() {
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [filterType, setFilterType] = useState<string>('ALL')
  const [showForm, setShowForm] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    typeDocument: 'ATTESTATION_SCOLARITE' as 'ATTESTATION_SCOLARITE' | 'RELEVE_NOTES' | 'CONVENTION_DE_STAGE'
  })

  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchDemandes()
    fetchStudents()
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
    }
  }

  const fetchDemandes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/api/admin/demandes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDemandes(response.data)
    } catch (error) {
      console.error('Error fetching demandes:', error)
      setErrorMessage('Erreur lors du chargement des demandes.')
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentNotes = async (etudiantId: number): Promise<Note[]> => {
  try {
    const token = localStorage.getItem('token')
    // Fix: Change the endpoint URL to match the backend controller
    const response = await axios.get(`${API_BASE_URL}/api/admin/etudiants/${etudiantId}/notes`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching notes:', error)
    // Return empty array if no notes or error occurs
    return []
  }
}

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

  const getMention = (note: number): string => {
    if (note >= 16) return 'TB'
    if (note >= 14) return 'B'
    if (note >= 12) return 'AB'
    if (note >= 10) return 'P'
    return 'AR'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent) {
      setErrorMessage('Veuillez sélectionner un étudiant.')
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
        typeDocument: formData.typeDocument
      }

      await axios.post(`${API_BASE_URL}/api/admin/demandes`, requestData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      setSuccessMessage('Demande créée avec succès !')
      fetchDemandes()
      resetForm()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      console.error('Error creating demande:', error)
      setErrorMessage(error.response?.data?.message || 'Erreur lors de la création de la demande.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async (id: number) => {
    if (window.confirm('Approuver cette demande ?')) {
      try {
        const token = localStorage.getItem('token')
        await axios.put(`${API_BASE_URL}/api/admin/demandes/${id}/approve`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setSuccessMessage('Demande approuvée !')
        fetchDemandes()
        setTimeout(() => setSuccessMessage(''), 3000)
      } catch (error) {
        console.error('Error approving demande:', error)
        setErrorMessage('Erreur lors de l\'approbation.')
      }
    }
  }

  const handleReject = async (id: number) => {
    if (window.confirm('Rejeter cette demande ?')) {
      try {
        const token = localStorage.getItem('token')
        await axios.put(`${API_BASE_URL}/api/admin/demandes/${id}/reject`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setSuccessMessage('Demande rejetée !')
        fetchDemandes()
        setTimeout(() => setSuccessMessage(''), 3000)
      } catch (error) {
        console.error('Error rejecting demande:', error)
        setErrorMessage('Erreur lors du rejet.')
      }
    }
  }

  const generatePDF = async (demande: Demande) => {
  try {
    const { default: jsPDF } = await import('jspdf')
  
    await generateOfficialDocument(demande)
    
    setSuccessMessage('PDF généré avec succès !')
    setTimeout(() => setSuccessMessage(''), 3000)
  } catch (error) {
    console.error('Error generating PDF:', error)
    setErrorMessage('Erreur lors de la génération du PDF.')
  }
}

  const generateOfficialDocument = async (demande: Demande) => {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const student = students.find(s => s.id === demande.etudiant.id)
    
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
    
    // Add logos
    try {
      const leftLogoData = await loadImageAsBase64('/ensa.png')
      doc.addImage(leftLogoData, 'PNG', 15, 10, 35, 20)
    } catch (error) {
      doc.setFillColor(26, 29, 41)
      doc.roundedRect(15, 10, 35, 20, 2, 2, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text('ENSA', 32.5, 18, { align: 'center' })
    }
    
    try {
      const rightLogoData = await loadImageAsBase64('/uh1.png')
      doc.addImage(rightLogoData, 'PNG', pageWidth - 50, 10, 30, 25)
    } catch (error) {
      doc.setFillColor(26, 29, 41)
      doc.roundedRect(pageWidth - 50, 10, 35, 20, 2, 2, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text('UH1', pageWidth - 32.5, 18, { align: 'center' })
    }
    
    // Title
    doc.setTextColor(220, 53, 69)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text(TYPE_LABELS[demande.typeDocument].toUpperCase(), pageWidth / 2, 45, { align: 'center' })
    
    let yPos = 65
    doc.setTextColor(0, 0, 0)
    
    if (demande.typeDocument === 'ATTESTATION_SCOLARITE') {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      
      doc.text(`Le Directeur de l'École Nationale des Sciences Appliquées de Berrechid`, 20, yPos)
      yPos += 10
      doc.text(`certifie que :`, 20, yPos)
      
      yPos += 15
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.text(`M./Mme ${demande.etudiant.prenom} ${demande.etudiant.nom}`.toUpperCase(), 20, yPos)
      
      yPos += 10
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text(`CIN : ${demande.etudiant.cin}`, 20, yPos)
      yPos += 7
      doc.text(`Code Apogée : ${demande.etudiant.codeApogee}`, 20, yPos)
      
      yPos += 15
      const attestText = `Est régulièrement inscrit(e) en qualité d'étudiant(e) à l'École Nationale des Sciences Appliquées de Berrechid, dans la filière ${demande.etudiant.filiere || '[Filière]'}, niveau ${student?.niveau || '[Niveau]'}, pour l'année universitaire ${student?.anneeUniversitaire || '2024-2025'}.`
      const lines = doc.splitTextToSize(attestText, pageWidth - 40)
      doc.text(lines, 20, yPos)
      
      yPos += lines.length * 7 + 10
      doc.text(`L'intéressé(e) suit régulièrement les enseignements et participe aux examens.`, 20, yPos)
      
      yPos += 15
      doc.text(`La présente attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.`, 20, yPos)
      
      yPos += 20
      doc.text(`Fait à Berrechid, le ${formatDate(demande.dateCreation)}`, 20, yPos)
      
      yPos += 15
      doc.setFont('helvetica', 'bold')
      doc.text(`Le Directeur`, pageWidth - 60, yPos)
      
    } else if (demande.typeDocument === 'RELEVE_NOTES') {
      // Fetch real notes from database
      const notes = await fetchStudentNotes(demande.etudiant.id)
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(`RELEVÉ DE NOTES`, pageWidth / 2, yPos, { align: 'center' })
      
      yPos += 15
      doc.setFont('helvetica', 'normal')
      doc.text(`Étudiant : ${demande.etudiant.prenom} ${demande.etudiant.nom}`, 20, yPos)
      yPos += 7
      doc.text(`Code Apogée : ${demande.etudiant.codeApogee}`, 20, yPos)
      yPos += 7
      doc.text(`Filière : ${demande.etudiant.filiere || '[Filière]'}`, 20, yPos)
      yPos += 7
      doc.text(`Année universitaire : ${student?.anneeUniversitaire || '2024-2025'}`, 20, yPos)
      yPos += 7
      doc.text(`Niveau : ${student?.niveau || '[Niveau]'}`, 20, yPos)
      
      yPos += 15
      
      // Table header
      doc.setFillColor(248, 250, 252)
      doc.rect(15, yPos, pageWidth - 30, 10, 'F')
      doc.setDrawColor(200, 200, 200)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text('Module', 20, yPos + 7)
      doc.text('Note /20', pageWidth - 70, yPos + 7)
      doc.text('Mention', pageWidth - 30, yPos + 7)
      
      yPos += 10
      
      if (notes.length > 0) {
        doc.setFont('helvetica', 'normal')
        let totalNotes = 0
        
        notes.forEach(note => {
          doc.line(15, yPos, pageWidth - 15, yPos)
          yPos += 8
          doc.text(note.module, 20, yPos, { maxWidth: 130 })
          doc.text(note.valeur.toFixed(2), pageWidth - 70, yPos)
          doc.text(getMention(note.valeur), pageWidth - 30, yPos)
          
          totalNotes += note.valeur
        })
        
        doc.line(15, yPos + 2, pageWidth - 15, yPos + 2)
        yPos += 12
        doc.setFont('helvetica', 'bold')
        const moyenne = notes.length > 0 ? (totalNotes / notes.length).toFixed(2) : '0.00'
        doc.text(`Moyenne générale : ${moyenne} / 20`, 20, yPos)
        
        const moyenneNum = parseFloat(moyenne)
        let mention = 'Passable'
        if (moyenneNum >= 16) mention = 'Très Bien'
        else if (moyenneNum >= 14) mention = 'Bien'
        else if (moyenneNum >= 12) mention = 'Assez Bien'
        
        doc.text(`Mention : ${mention}`, pageWidth - 60, yPos)
      } else {
        yPos += 15
        doc.setFont('helvetica', 'normal')
        doc.text('Aucune note disponible pour cet étudiant.', 25, yPos)
      }
      
      yPos += 15
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text('Barème : Très Bien (16-20) | Bien (14-16) | Assez Bien (12-14) | Passable (10-12)', 20, yPos)
      
    } else if (demande.typeDocument === 'CONVENTION_DE_STAGE') {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('CONVENTION DE STAGE', pageWidth / 2, yPos, { align: 'center' })
      
      yPos += 15
      doc.setFont('helvetica', 'normal')
      doc.text('Entre les soussignés :', 20, yPos)
      
      yPos += 12
      doc.setFont('helvetica', 'bold')
      doc.text('L\'École Nationale des Sciences Appliquées de Berrechid', 20, yPos)
      yPos += 6
      doc.setFont('helvetica', 'normal')
      doc.text('Représentée par son Directeur', 20, yPos)
      yPos += 5
      doc.text('Avenue de l\'Université, BP 218 Berrechid', 20, yPos)
      
      yPos += 12
      doc.text('D\'une part,', 20, yPos)
      yPos += 12
      doc.text('Et', 20, yPos)
      yPos += 10
      doc.setFont('helvetica', 'bold')
      doc.text('L\'ENTREPRISE', 20, yPos)
      yPos += 6
      doc.setFont('helvetica', 'normal')
      doc.text('Nom : _______________________________________', 20, yPos)
      yPos += 6
      doc.text('Adresse : ____________________________________', 20, yPos)
      
      yPos += 12
      doc.text('D\'autre part,', 20, yPos)
      yPos += 12
      doc.setFont('helvetica', 'bold')
      doc.text('Article 1 : Objet de la convention', 20, yPos)
      yPos += 6
      doc.setFont('helvetica', 'normal')
      const art1 = `La présente convention a pour objet de définir les modalités du stage effectué par l'étudiant(e) ${demande.etudiant.prenom} ${demande.etudiant.nom}, inscrit(e) en ${student?.niveau || '[Niveau]'}, filière ${demande.etudiant.filiere || '[Filière]'}.`
      const art1Lines = doc.splitTextToSize(art1, pageWidth - 40)
      doc.text(art1Lines, 20, yPos)
      
      yPos += art1Lines.length * 5 + 8
      doc.setFont('helvetica', 'bold')
      doc.text('Article 2 : Durée et période du stage', 20, yPos)
      yPos += 6
      doc.setFont('helvetica', 'normal')
      doc.text('Date de début : ____ / ____ / ________', 20, yPos)
      yPos += 6
      doc.text('Date de fin : ____ / ____ / ________', 20, yPos)
      yPos += 6
      doc.text('Durée totale : __________ semaines', 20, yPos)
      
      yPos += 12
      doc.setFont('helvetica', 'bold')
      doc.text('Article 3 : Encadrement', 20, yPos)
      yPos += 6
      doc.setFont('helvetica', 'normal')
      doc.text('Tuteur pédagogique : _____________________________', 20, yPos)
      yPos += 6
      doc.text('Maître de stage (entreprise) : ____________________', 20, yPos)
    }
    
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
    doc.text('Avenue de l\'Université, BP 218 Berrechid - Tél: +212 5XX XX XX XX', pageWidth / 2, yPos, { align: 'center' })
    
    const fileName = `${TYPE_LABELS[demande.typeDocument].replace(/ /g, '_')}_${demande.etudiant.nom}.pdf`
    doc.save(fileName)
  }

  const resetForm = () => {
    setFormData({ typeDocument: 'ATTESTATION_SCOLARITE' })
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

  const filteredDemandes = demandes.filter(demande => {
    const matchesSearch = 
      demande.etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.etudiant.codeApogee.toString().includes(searchTerm) ||
      demande.id.toString().includes(searchTerm)
    
    const matchesStatus = filterStatus === 'ALL' || demande.status === filterStatus
    const matchesType = filterType === 'ALL' || demande.typeDocument === filterType
    
    return matchesSearch && matchesStatus && matchesType
  })

  const suggestions = getSuggestions()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8E9EA' }}>
        <div className="flex items-center space-x-3">
          <FaSpinner className="animate-spin text-2xl" style={{ color: '#3D3F4A' }} />
          <span style={{ color: '#3D3F4A' }}>Chargement des demandes...</span>
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
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1A1D29' }}>Gestion des Demandes</h1>
          <p style={{ color: '#7D8491' }}>Gérer les demandes de documents des étudiants</p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            style={{ backgroundColor: '#3D3F4A', color: 'white' }}
          >
            <FaPlus />
            <span>Nouvelle Demande</span>
          </button>
        )}

        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A1D29' }}>
              Créer une Nouvelle Demande
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
                      style={{ backgroundColor: '#F5F5F6', borderColor: '#D1D2D4', color: '#1A1D29' }}
                    />
                  </div>

                  {showSuggestions && suggestions.length > 0 && (
                    <div 
                      className="absolute z-10 w-full mt-2 rounded-xl shadow-2xl border overflow-hidden"
                      style={{ backgroundColor: 'white', borderColor: '#D1D2D4', maxHeight: '300px', overflowY: 'auto' }}
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
                          <div className="text-sm" style={{ color: '#7D8491' }}>
                            Code: {student.codeApogee} | {student.filiere}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#1A1D29' }}>
                  Type de Document *
                </label>
                <select
                  value={formData.typeDocument}
                  onChange={(e) => setFormData({...formData, typeDocument: e.target.value as any})}
                  className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                  style={{ backgroundColor: '#F5F5F6', borderColor: '#D1D2D4', color: '#1A1D29' }}
                  required
                >
                  <option value="ATTESTATION_SCOLARITE">Attestation de scolarité</option>
                  <option value="RELEVE_NOTES">Relevé de notes</option>
                  <option value="CONVENTION_DE_STAGE">Convention de stage</option>
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                  style={{ backgroundColor: '#3D3F4A', color: 'white' }}
                >
                  Créer la Demande
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

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: '#7D8491' }} />
              <input
                type="text"
                placeholder="Rechercher par étudiant, code Apogée ou N° demande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                style={{ backgroundColor: '#F5F5F6', borderColor: '#D1D2D4', color: '#1A1D29' }}
              />
            </div>
            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                style={{ backgroundColor: '#F5F5F6', borderColor: '#D1D2D4', color: '#1A1D29' }}
              >
                <option value="ALL">Tous les statuts</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="APPROVEE">Approuvée</option>
                <option value="REFUSEE">Refusée</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                style={{ backgroundColor: '#F5F5F6', borderColor: '#D1D2D4', color: '#1A1D29' }}
              >
                <option value="ALL">Tous les types</option>
                <option value="ATTESTATION_SCOLARITE">Attestation</option>
                <option value="RELEVE_NOTES">Relevé de notes</option>
                <option value="CONVENTION_DE_STAGE">Convention</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: '#F5F5F6' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>N° Demande</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>Étudiant</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>Statut</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#E8E9EA' }}>
                {filteredDemandes.map((demande) => (
                  <tr key={demande.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium" style={{ color: '#1A1D29' }}>#{demande.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#3D3F4A' }}>
                      <div>
                        <div className="font-semibold">{demande.etudiant.prenom} {demande.etudiant.nom}</div>
                        <div className="text-sm" style={{ color: '#7D8491' }}>Code: {demande.etudiant.codeApogee}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#3D3F4A' }}>{TYPE_LABELS[demande.typeDocument]}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold" style={{
                        backgroundColor: demande.status === 'APPROVEE' ? '#D1FAE5' : demande.status === 'REFUSEE' ? '#FEE2E2' : '#FEF3C7',
                        color: demande.status === 'APPROVEE' ? '#065F46' : demande.status === 'REFUSEE' ? '#991B1B' : '#92400E'
                      }}>
                        {STATUS_LABELS[demande.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#7D8491' }}>{formatDate(demande.dateCreation)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {demande.status === 'EN_ATTENTE' && (
                          <>
                            <button onClick={() => handleApprove(demande.id)} className="p-2 rounded-lg transition-all hover:bg-green-50" style={{ color: '#10B981' }} title="Approuver">
                              <FaCheck />
                            </button>
                            <button onClick={() => handleReject(demande.id)} className="p-2 rounded-lg transition-all hover:bg-red-50" style={{ color: '#EF4444' }} title="Rejeter">
                              <FaTimes />
                            </button>
                          </>
                        )}
                        <button onClick={() => generatePDF(demande)} className="p-2 rounded-lg transition-all hover:bg-blue-50" style={{ color: '#3B82F6' }} title="Générer PDF">
                          <FaDownload />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDemandes.length === 0 && (
            <div className="text-center py-12" style={{ color: '#7D8491' }}>
              <FaFileAlt className="mx-auto text-5xl mb-4" />
              <p className="text-lg">Aucune demande trouvée.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RequestsManagement