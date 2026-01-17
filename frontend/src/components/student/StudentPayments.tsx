import { useState, useEffect } from 'react'
import axios from 'axios'
import { FaPlus, FaSpinner, FaEye, FaCreditCard, FaCheckCircle, FaClock, FaHourglassHalf, FaFileInvoice } from 'react-icons/fa'

interface Payment {
  id: number
  typePaiement: 'FRAIS_INSCRIPTION' | 'FRAIS_SCOLARITE' | 'ASSURANCE' | 'AUTRES'
  status: 'PAYE' | 'NON_PAYE' | 'EN_COURS'
  montant: number
  dateCreation: string
  datePaiement: string | null
  etudiant: {
    id: number
    nom: string
    prenom: string
    email: string
    codeApogee: string
    cin: string
    filiere: string
  }
}

interface StudentProfile {
  email: string
  codeApogee: number
  cin: string
  nom: string
  prenom: string
  filiere: string
}

const API_BASE_URL = 'http://localhost:8080'

const TYPE_LABELS = {
  FRAIS_INSCRIPTION: "Frais d'inscription",
  FRAIS_SCOLARITE: 'Frais de scolarité',
  ASSURANCE: 'Assurance',
  AUTRES: 'Autres'
}

const STATUS_LABELS = {
  PAYE: 'Payé',
  NON_PAYE: 'Non payé',
  EN_COURS: 'En cours'
}

function StudentPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    typePaiement: 'FRAIS_INSCRIPTION' as 'FRAIS_INSCRIPTION' | 'FRAIS_SCOLARITE' | 'ASSURANCE' | 'AUTRES',
    montant: ''
  })

  useEffect(() => {
    fetchProfile()
    fetchPayments()
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
        cin: response.data.cin,
        nom: response.data.nom,
        prenom: response.data.prenom,
        filiere: response.data.filiere
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/api/etudiant/paiements`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPayments(response.data)
    } catch (error) {
      console.error('Error fetching payments:', error)
      setErrorMessage('Erreur lors du chargement des paiements.')
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
        typePaiement: formData.typePaiement,
        montant: parseFloat(formData.montant)
      }

      await axios.post(`${API_BASE_URL}/api/etudiant/paiements`, requestData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      setSuccessMessage('Paiement créé avec succès !')
      fetchPayments()
      resetForm()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      console.error('Error creating payment:', error)
      setErrorMessage(error.response?.data?.message || 'Erreur lors de la création du paiement.')
    } finally {
      setSubmitting(false)
    }
  }

  const generateReceipt = async (paiement: Payment) => {
    try {
      if (!paiement || !paiement.etudiant) {
        throw new Error('Données du paiement incomplètes')
      }

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
        doc.text('LOGO', 32.5, 23, { align: 'center' })
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
        doc.text('ENSA', pageWidth - 32.5, 18, { align: 'center' })
        doc.text('LOGO', pageWidth - 32.5, 23, { align: 'center' })
      }
      
      // Title
      doc.setTextColor(220, 53, 69)
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text('REÇU DE PAIEMENT', pageWidth / 2, 45, { align: 'center' })
      
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
        
        const date = new Date(dateStr)
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
          })
        }
        
        return dateStr
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
      
      // ORDER DETAIL
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
      
      // STUDENT INFO
      yPos += 10
      doc.setFillColor(248, 250, 252)
      doc.rect(15, yPos, pageWidth - 30, 10, 'F')
      doc.setFont('helvetica', 'bold')
      doc.text("INFORMATIONS DE L'ÉTUDIANT", 17, yPos + 6)
      
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
      
      // ESTABLISHMENT DETAIL
      yPos += 5
      doc.setFillColor(248, 250, 252)
      doc.rect(15, yPos, pageWidth - 30, 10, 'F')
      doc.setFont('helvetica', 'bold')
      doc.text('DÉTAIL ÉTABLISSEMENT', 17, yPos + 6)
      
      yPos += 15
      doc.setFont('helvetica', 'normal')
      doc.text("Nom de l'établissement", 20, yPos)
      doc.text(':', 75, yPos)
      doc.setFont('helvetica', 'bold')
      doc.text('ENSA BERRECHID', 80, yPos)
      
      yPos += 7
      doc.setFont('helvetica', 'normal')
      doc.text('Adresse', 20, yPos)
      doc.text(':', 75, yPos)
      doc.setFont('helvetica', 'bold')
      const address = "Avenue de l'Université, BP 218 Berrechid"
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

  const resetForm = () => {
    setFormData({
      typePaiement: 'FRAIS_INSCRIPTION',
      montant: ''
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

  const getPaymentTypeLabel = (type: string) => {
    return TYPE_LABELS[type as keyof typeof TYPE_LABELS] || type
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PAYE: { bg: '#D1FAE5', color: '#065F46', label: 'Payé', icon: FaCheckCircle },
      NON_PAYE: { bg: '#FEE2E2', color: '#991B1B', label: 'Non Payé', icon: FaClock },
      EN_COURS: { bg: '#FEF3C7', color: '#92400E', label: 'En Cours', icon: FaHourglassHalf }
    }
    const style = styles[status as keyof typeof styles] || styles.NON_PAYE
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#E8E9EA' }}>
      {submitting && (
        <div className="fixed inset-0 flex items-center justify-center " style={{ backgroundColor: 'rgba(26, 29, 41, 0.7)' }}>
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
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1A1D29' }}>Mes Paiements</h1>
          <p style={{ color: '#7D8491' }}>Gérer et consulter vos paiements</p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl"
            style={{ backgroundColor: '#3D3F4A', color: 'white' }}
          >
            <FaPlus />
            <span>Nouveau Paiement</span>
          </button>
        )}

        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A1D29' }}>
              Nouveau Paiement
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#1A1D29' }}>
                    Type de Paiement *
                  </label>
                  <select
                    value={formData.typePaiement}
                    onChange={(e) => setFormData({...formData, typePaiement: e.target.value as any})}
                    className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: '#F5F5F6',
                      borderColor: '#D1D2D4',
                      color: '#1A1D29'
                    }}
                    required
                  >
                    <option value="FRAIS_INSCRIPTION">Frais d'Inscription</option>
                    <option value="FRAIS_SCOLARITE">Frais de Scolarité</option>
                    <option value="ASSURANCE">Assurance</option>
                    <option value="AUTRES">Autres</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#1A1D29' }}>
                    Montant (MAD) *
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
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                  style={{ backgroundColor: '#3D3F4A', color: 'white' }}
                >
                  Créer le paiement
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
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: '#D1FAE5' }}>
                          <FaCreditCard style={{ color: '#065F46' }} />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium" style={{ color: '#1A1D29' }}>
                            {getPaymentTypeLabel(payment.typePaiement)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-lg" style={{ color: '#10B981' }}>
                        {payment.montant.toFixed(2)} MAD
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#7D8491' }}>
                      {formatDateOnly(payment.dateCreation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment)
                            setShowDetailsModal(true)
                          }}
                          className="p-2 rounded-lg transition-all hover:bg-blue-50"
                          style={{ color: '#3B82F6' }}
                          title="Voir détails"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => generateReceipt(payment)}
                          className="p-2 rounded-lg transition-all hover:bg-green-50"
                          style={{ color: '#10B981' }}
                          title="Télécharger reçu"
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

          {payments.length === 0 && (
            <div className="text-center py-12" style={{ color: '#7D8491' }}>
              <FaCreditCard className="mx-auto text-5xl mb-4" />
              <p className="text-lg">Aucun paiement trouvé.</p>
              <p className="text-sm mt-2">Cliquez sur "Nouveau Paiement" pour créer votre premier paiement.</p>
            </div>
          )}
        </div>
      </div>

      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(26, 29, 41, 0.7)' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#1A1D29' }}>
                Détails du Paiement
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
                <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>TYPE DE PAIEMENT</h3>
                <p className="font-semibold" style={{ color: '#1A1D29' }}>
                  {getPaymentTypeLabel(selectedPayment.typePaiement)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>MONTANT</h3>
                <p className="font-bold text-2xl" style={{ color: '#10B981' }}>
                  {selectedPayment.montant.toFixed(2)} MAD
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>STATUT</h3>
                {getStatusBadge(selectedPayment.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>DATE DE CRÉATION</h3>
                  <p style={{ color: '#1A1D29' }}>
                    {formatDateOnly(selectedPayment.dateCreation)}
                  </p>
                </div>
                {selectedPayment.datePaiement && (
                  <div>
                    <h3 className="text-sm font-bold mb-2" style={{ color: '#7D8491' }}>DATE DE PAIEMENT</h3>
                    <p style={{ color: '#1A1D29' }}>
                      {formatDateOnly(selectedPayment.datePaiement)}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t" style={{ borderColor: '#E8E9EA' }}>
                <button
                  onClick={() => generateReceipt(selectedPayment)}
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2"
                  style={{ backgroundColor: '#10B981', color: 'white' }}
                >
                  <FaFileInvoice />
                  <span>Télécharger Reçu</span>
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

export default StudentPayments