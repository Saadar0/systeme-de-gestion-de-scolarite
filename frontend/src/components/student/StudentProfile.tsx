import { useState, useEffect } from 'react'
import axios from 'axios'
import { FaGraduationCap, FaEnvelope, FaIdCard, FaSpinner, FaUser } from 'react-icons/fa'
import { QRCodeCanvas } from 'qrcode.react'

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

function StudentProfile() {
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/api/etudiant/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStudent(response.data)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Erreur lors du chargement du profil.')
    } finally {
      setLoading(false)
    }
  }

  // Generate QR code data with student information
  const generateQRData = () => {
    if (!student) return ''
    
    return JSON.stringify({
      id: student.id,
      nom: student.nom,
      prenom: student.prenom,
      codeApogee: student.codeApogee,
      cin: student.cin,
      filiere: student.filiere,
      niveau: student.niveau,
      email: student.email,
      anneeUniversitaire: student.anneeUniversitaire
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8E9EA' }}>
        <div className="flex items-center space-x-3">
          <FaSpinner className="animate-spin text-2xl" style={{ color: '#3D3F4A' }} />
          <span style={{ color: '#3D3F4A' }}>Chargement du profil...</span>
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8E9EA' }}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Profil introuvable'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#E8E9EA' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1A1D29' }}>Mon Profil</h1>
          <p style={{ color: '#7D8491' }}>Carte d'étudiant</p>
        </div>

        {/* Student Card */}
        <div className="relative">
          {/* Card Container with 3D effect */}
          <div 
            className="bg-gradient-to-br rounded-3xl shadow-2xl overflow-hidden transform transition-transform hover:scale-[1.02]"
            style={{ 
              backgroundImage: 'linear-gradient(135deg, #1A1D29 0%, #3D3F4A 100%)',
              minHeight: '500px'
            }}
          >
            {/* Decorative Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: '#7D8491' }}></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: '#B1B2B5' }}></div>
            </div>

            {/* Card Header */}
            <div className="relative px-8 pt-8 pb-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <FaGraduationCap className="text-2xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">ENSA Berrechid</h2>
                    <p className="text-sm" style={{ color: '#B1B2B5' }}>École Nationale des Sciences Appliquées</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold" style={{ color: '#B1B2B5' }}>ANNÉE UNIVERSITAIRE</p>
                  <p className="text-lg font-bold text-white">{student.anneeUniversitaire}</p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="relative p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Side - Photo and QR Code */}
                <div className="flex flex-col items-center lg:items-start space-y-6">
                  {/* Profile Photo Placeholder */}
                  <div 
                    className="w-48 h-48 rounded-2xl flex items-center justify-center shadow-xl"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <FaUser className="text-6xl" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                  </div>
                  
                  {/* QR Code - Real */}
                  <div className="bg-white p-3 rounded-xl shadow-xl">
                    <QRCodeCanvas
                      value={generateQRData()}
                      size={128}
                      level="H"
                      includeMargin={false}
                      fgColor="#1A1D29"
                      bgColor="#FFFFFF"
                    />
                    <p className="text-center text-xs mt-2 font-semibold" style={{ color: '#7D8491' }}>
                      Scannez-moi
                    </p>
                  </div>
                </div>

                {/* Right Side - Student Information */}
                <div className="flex-1 space-y-6">
                  {/* Student Name */}
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: '#B1B2B5' }}>NOM COMPLET</p>
                    <h3 className="text-3xl font-bold text-white uppercase">
                      {student.prenom} {student.nom}
                    </h3>
                  </div>

                  {/* Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {/* Code Apogée */}
                    <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <div className="flex items-center space-x-3 mb-2">
                        <FaIdCard style={{ color: '#B1B2B5' }} />
                        <p className="text-xs font-semibold" style={{ color: '#B1B2B5' }}>CODE APOGÉE</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{student.codeApogee}</p>
                    </div>

                    {/* CIN */}
                    <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <div className="flex items-center space-x-3 mb-2">
                        <FaIdCard style={{ color: '#B1B2B5' }} />
                        <p className="text-xs font-semibold" style={{ color: '#B1B2B5' }}>CIN</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{student.cin}</p>
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2 p-4 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <div className="flex items-center space-x-3 mb-2">
                        <FaEnvelope style={{ color: '#B1B2B5' }} />
                        <p className="text-xs font-semibold" style={{ color: '#B1B2B5' }}>EMAIL</p>
                      </div>
                      <p className="text-lg font-semibold text-white">{student.email}</p>
                    </div>

                    {/* Filière */}
                    <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <p className="text-xs font-semibold mb-2" style={{ color: '#B1B2B5' }}>FILIÈRE</p>
                      <p className="text-lg font-bold text-white">{student.filiere}</p>
                    </div>

                    {/* Niveau */}
                    <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <p className="text-xs font-semibold mb-2" style={{ color: '#B1B2B5' }}>NIVEAU</p>
                      <p className="text-lg font-bold text-white uppercase">{student.niveau}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div 
              className="relative px-8 py-4 border-t"
              style={{ 
                borderColor: 'rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(0, 0, 0, 0.2)'
              }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs" style={{ color: '#B1B2B5' }}>
                  ID Étudiant: #{student.id.toString().padStart(6, '0')}
                </p>
                <p className="text-xs" style={{ color: '#B1B2B5' }}>
                  Cette carte est la propriété de l'ENSA Berrechid
                </p>
              </div>
            </div>
          </div>

          {/* Card Shadow Effect */}
          <div 
            className="absolute inset-0 -z-10 translate-y-4 rounded-3xl"
            style={{ 
              background: 'linear-gradient(135deg, rgba(26, 29, 41, 0.4) 0%, rgba(61, 63, 74, 0.4) 100%)',
              filter: 'blur(20px)'
            }}
          ></div>
        </div>

        {/* Info Note */}
        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: '#7D8491' }}>
            Pour toute modification de vos informations, veuillez contacter le service de scolarité
          </p>
          <p className="text-xs mt-2" style={{ color: '#7D8491' }}>
            Le QR code contient toutes vos informations pour une vérification rapide
          </p>
        </div>
      </div>
    </div>
  )
}

export default StudentProfile