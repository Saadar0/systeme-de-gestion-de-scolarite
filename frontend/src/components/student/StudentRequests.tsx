import { useState, useEffect } from 'react'
import axios from 'axios'
import { FaPlus, FaSpinner, FaEye, FaFileAlt, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaDownload } from 'react-icons/fa'

interface Request {
  id: number
  typeDocument: 'ATTESTATION_SCOLARITE' | 'RELEVE_NOTES' | 'CONVENTION_DE_STAGE'
  status: 'EN_ATTENTE' | 'APPROVEE' | 'REFUSEE'
  dateCreation: string
  dateTraitement: string | null
  etudiant: {
    id: number
    nom: string
    prenom: string
    email: string
    codeApogee: string
    cin: string
    filiere: string
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
  nom: string
  prenom: string
  filiere: string
  niveau: string
  anneeUniversitaire: string
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
}

const STATUS_LABELS = {
  EN_ATTENTE: 'En attente',
  APPROVEE: 'Approuvée',
  REFUSEE: 'Refusée'
}

function StudentRequests() {
  const [requests, setRequests] = useState<Request[]>([])
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [documentType, setDocumentType] = useState<'ATTESTATION_SCOLARITE' | 'RELEVE_NOTES' | 'CONVENTION_DE_STAGE'>('ATTESTATION_SCOLARITE')

  useEffect(() => {
    fetchProfile()
    fetchRequests()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/api/etudiant/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProfile(response.data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/api/etudiant/demandes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRequests(response.data)
    } catch (error) {
      console.error('Error fetching requests:', error)
      setErrorMessage('Erreur lors du chargement des demandes.')
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentNotes = async (): Promise<Note[]> => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/api/etudiant/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching notes:', error)
      return []
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
        typeDocument: documentType
      }

      await axios.post(`${API_BASE_URL}/api/etudiant/demandes`, requestData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      setSuccessMessage('Demande créée avec succès !')
      fetchRequests()
      setShowForm(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      console.error('Error creating request:', error)
      setErrorMessage(error.response?.data?.message || 'Erreur lors de la création de la demande.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A'
    
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
    return dateStr
  }

  const getMention = (note: number): string => {
    if (note >= 16) return 'TB'
    if (note >= 14) return 'B'
    if (note >= 12) return 'AB'
    if (note >= 10) return 'P'
    return 'AR'
  }

  const generatePDF = async (demande: Request) => {
  // Check if request is approved
  if (demande.status !== 'APPROVEE') {
    setErrorMessage('Vous pouvez télécharger le PDF uniquement après approbation de la demande.')
    setTimeout(() => setErrorMessage(''), 4000)
    return
  }

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

  const generateOfficialDocument = async (demande: Request) => {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
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
    
    doc.setTextColor(220, 53, 69)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text(TYPE_LABELS[demande.typeDocument].toUpperCase(), pageWidth / 2, 45, { align: 'center' })
    
    let yPos = 65
    doc.setTextColor(0, 0, 0)
    
    if (demande.typeDocument === 'ATTESTATION_SCOLARITE') {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      
      doc.text("Le Directeur de l'École Nationale des Sciences Appliquées de Berrechid", 20, yPos)
      yPos += 10
      doc.text('certifie que :', 20, yPos)
      
      yPos += 15
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.text(`M./Mme ${demande.etudiant.prenom} ${demande.etudiant.nom}`.toUpperCase(), 20, yPos)
      
      yPos += 10
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.text('Né(e) le : [Date de naissance]', 20, yPos)
      yPos += 7
      doc.text(`CIN : ${demande.etudiant.cin}`, 20, yPos)
      yPos += 7
      doc.text(`Code Apogée : ${demande.etudiant.codeApogee}`, 20, yPos)
      
      yPos += 15
      const attestText = `Est régulièrement inscrit(e) en qualité d'étudiant(e) à l'École Nationale des Sciences Appliquées de Berrechid, dans la filière ${demande.etudiant.filiere || '[Filière]'}, niveau ${profile?.niveau || '[Niveau]'}, pour l'année universitaire ${profile?.anneeUniversitaire || '2024-2025'}.`
      const lines = doc.splitTextToSize(attestText, pageWidth - 40)
      doc.text(lines, 20, yPos)
      
      yPos += lines.length * 7 + 10
      doc.text("L'intéressé(e) suit régulièrement les enseignements et participe aux examens.", 20, yPos)
      
      yPos += 15
      doc.text("La présente attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.", 20, yPos)
      
      yPos += 20
      doc.text(`Fait à Berrechid, le ${formatDate(demande.dateCreation)}`, 20, yPos)
      
      yPos += 15
      doc.setFont('helvetica', 'bold')
      doc.text('Le Directeur', pageWidth - 60, yPos)
      
    } else if (demande.typeDocument === 'RELEVE_NOTES') {
      const notes = await fetchStudentNotes()
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text('RELEVÉ DE NOTES', pageWidth / 2, yPos, { align: 'center' })
      
      yPos += 15
      doc.setFont('helvetica', 'normal')
      doc.text(`Étudiant : ${demande.etudiant.prenom} ${demande.etudiant.nom}`, 20, yPos)
      yPos += 7
      doc.text(`Code Apogée : ${demande.etudiant.codeApogee}`, 20, yPos)
      yPos += 7
      doc.text(`Filière : ${demande.etudiant.filiere || '[Filière]'}`, 20, yPos)
      yPos += 7
      doc.text(`Année universitaire : ${profile?.anneeUniversitaire || '2024-2025'}`, 20, yPos)
      yPos += 7
      doc.text(`Niveau : ${profile?.niveau || '[Niveau]'}`, 20, yPos)
      
      yPos += 15
      
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
      doc.text("L'École Nationale des Sciences Appliquées de Berrechid", 20, yPos)
      yPos += 6
      doc.setFont('helvetica', 'normal')
      doc.text('Représentée par son Directeur', 20, yPos)
      yPos += 5
      doc.text("Avenue de l'Université, BP 218 Berrechid", 20, yPos)
      
      yPos += 12
      doc.text("D'une part,", 20, yPos)
      yPos += 12
      doc.text('Et', 20, yPos)
      yPos += 10
      doc.setFont('helvetica', 'bold')
      doc.text("L'ENTREPRISE", 20, yPos)
      yPos += 6
      doc.setFont('helvetica', 'normal')
      doc.text('Nom : _______________________________________', 20, yPos)
      yPos += 6
      doc.text('Adresse : ____________________________________', 20, yPos)
      
      yPos += 12
      doc.text("D'autre part,", 20, yPos)
      yPos += 12
      doc.setFont('helvetica', 'bold')
      doc.text('Article 1 : Objet de la convention', 20, yPos)
      yPos += 6
      doc.setFont('helvetica', 'normal')
      const art1 = `La présente convention a pour objet de définir les modalités du stage effectué par l'étudiant(e) ${demande.etudiant.prenom} ${demande.etudiant.nom}, inscrit(e) en ${profile?.niveau || '[Niveau]'}, filière ${demande.etudiant.filiere || '[Filière]'}.`
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
    
    yPos = doc.internal.pageSize.getHeight() - 20
    doc.setDrawColor(220, 220, 220)
    doc.line(15, yPos, pageWidth - 15, yPos)
    yPos += 7
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text('École Nationale des Sciences Appliquées de Berrechid', pageWidth / 2, yPos, { align: 'center' })
    yPos += 4
    doc.text("Avenue de l'Université, BP 218 Berrechid - Tél: +212 5XX XX XX XX", pageWidth / 2, yPos, { align: 'center' })
    
    const fileName = `${TYPE_LABELS[demande.typeDocument].replace(/ /g, '_')}_${demande.etudiant.nom}.pdf`
    doc.save(fileName)
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

  const getDocumentLabel = (type: string) => {
    return TYPE_LABELS[type as keyof typeof TYPE_LABELS] || type
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      EN_ATTENTE: { bg: '#FEF3C7', color: '#92400E', label: 'En Attente', icon: FaClock },
      EN_COURS: { bg: '#DBEAFE', color: '#1E40AF', label: 'En Cours', icon: FaHourglassHalf },
      APPROVEE: { bg: '#D1FAE5', color: '#065F46', label: 'Approuvée', icon: FaCheckCircle },
      REFUSEE: { bg: '#FEE2E2', color: '#991B1B', label: 'Refusée', icon: FaTimesCircle }
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

  const getDocumentIcon = (type: string) => {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: '#E0E7FF' }}>
        <FaFileAlt style={{ color: '#3730A3' }} />
      </div>
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#E8E9EA' }}>
      {submitting && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(26, 29, 41, 0.7)', zIndex: 50 }}>
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
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1A1D29' }}>Mes Demandes</h1>
          <p style={{ color: '#7D8491' }}>Créer et consulter vos demandes de documents</p>
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
              Nouvelle Demande de Document
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#1A1D29' }}>
                  Type de Document *
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: '#F5F5F6',
                    borderColor: '#D1D2D4',
                    color: '#1A1D29'
                  }}
                  required
                >
                  <option value="ATTESTATION_SCOLARITE">Attestation de Scolarité</option>
                  <option value="RELEVE_NOTES">Relevé de Notes</option>
                  <option value="CONVENTION_DE_STAGE">Convention de Stage</option>
                </select>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                  style={{ backgroundColor: '#3D3F4A', color: 'white' }}
                >
                  Soumettre la demande
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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
                    Type de Document
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Date de Création
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#E8E9EA' }}>
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getDocumentIcon(request.typeDocument)}
                        <div className="ml-4">
                          <div className="font-medium" style={{ color: '#1A1D29' }}>
                            {getDocumentLabel(request.typeDocument)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#7D8491' }}>
                      {formatDateOnly(request.dateCreation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request)
                            setShowDetailsModal(true)
                          }}
                          className="p-2 rounded-lg transition-all hover:bg-blue-50"
                          style={{ color: '#3B82F6' }}
                          title="Voir détails"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => generatePDF(request)}
                          disabled={request.status !== 'APPROVEE'}
                          className="p-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ 
                            color: request.status === 'APPROVEE' ? '#10B981' : '#9CA3AF',
                            backgroundColor: request.status === 'APPROVEE' ? 'transparent' : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            if (request.status === 'APPROVEE') {
                              e.currentTarget.style.backgroundColor = '#D1FAE5'
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                          title={request.status === 'APPROVEE' ? 'Télécharger PDF' : 'Disponible après approbation'}
                        >
                          <FaDownload />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {requests.length === 0 && (
            <div className="text-center py-12" style={{ color: '#7D8491' }}>
              <FaFileAlt className="mx-auto text-5xl mb-4" />
              <p className="text-lg">Aucune demande trouvée.</p>
              <p className="text-sm mt-2">Cliquez sur "Nouvelle Demande" pour créer votre première demande.</p>
            </div>
          )}
        </div>
      </div>

      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(26, 29, 41, 0.7)' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#1A1D29' }}>
                Détails de la Demande
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 rounded-lg transition-all hover:bg-gray-100"
                style={{ color: '#7D8491' }}
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>TYPE DE DOCUMENT</h3>
                <p className="font-semibold" style={{ color: '#1A1D29' }}>
                  {getDocumentLabel(selectedRequest.typeDocument)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>STATUT</h3>
                {getStatusBadge(selectedRequest.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>DATE DE CRÉATION</h3>
                  <p style={{ color: '#1A1D29' }}>
                    {formatDateOnly(selectedRequest.dateCreation)}
                  </p>
                </div>
                {selectedRequest.dateTraitement && (
                  <div>
                    <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>DATE DE TRAITEMENT</h3>
                    <p style={{ color: '#1A1D29' }}>
                      {formatDateOnly(selectedRequest.dateTraitement)}
                    </p>
                  </div>
                )}
              </div>

              {selectedRequest.status !== 'APPROVEE' && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                  <p className="text-sm">
                    Le téléchargement du PDF sera disponible une fois que la demande sera approuvée.
                  </p>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t" style={{ borderColor: '#E8E9EA' }}>
                <button
                  onClick={() => generatePDF(selectedRequest)}
                  disabled={selectedRequest.status !== 'APPROVEE'}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: selectedRequest.status === 'APPROVEE' ? '#10B981' : '#D1D2D4', 
                    color: 'white' 
                  }}
                >
                  <FaDownload />
                  <span>Télécharger PDF</span>
                </button>
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

export default StudentRequests