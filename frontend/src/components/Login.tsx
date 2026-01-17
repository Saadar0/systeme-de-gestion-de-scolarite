import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FaGraduationCap, FaGoogle, FaFacebook } from 'react-icons/fa'

const API_BASE_URL = 'http://localhost:8080'

interface LoginProps {
  onLogin: (token: string, role: string) => void
}

function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username,
        password
      })

      const { token, role } = response.data
      console.log('Login successful:', { role })

      onLogin(token, role)

      if (role === 'ADMIN') {
        navigate('/admin', { replace: true })
      } else if (role === 'ETUDIANT') {
        navigate('/', { replace: true })
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.response?.data?.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Midnight Blue Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ backgroundColor: '#1A1D29' }}>
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: '#7d84911a' }}></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(177, 178, 181, 0.08)' }}></div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          {/* Logo */}
          <div className="flex items-center gap-x-3 mb-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl backdrop-blur-sm" style={{ backgroundColor: 'rgba(125, 132, 145, 0.2)' }}>
              <FaGraduationCap className="text-2xl text-white" />
            </div>
            <span className="text-2xl font-bold">Service de Scolarité EnsaB</span>
          </div>

          {/* Main Content */}
          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-6">
              Bienvenue à Ensa Berrechid !
            </h1>
            <p className="text-xl font-semibold mb-4" style={{ color: '#B1B2B5' }}>
              Découvrez notre système de scolarité moderne !
            </p>
            <p className="text-base leading-relaxed" style={{ color: '#7D8491' }}>
              Simplifiez vos démarches administratives avec notre plateforme digitale dédiée aux étudiants et au personnel.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-8 py-12" style={{ backgroundColor: '#E8E9EA' }}>
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-x-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: '#3D3F4A' }}>
              <FaGraduationCap className="text-2xl text-white" />
            </div>
            <span className="text-2xl font-bold" style={{ color: '#1A1D29' }}>EnsaB</span>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10" style={{ boxShadow: '0 20px 60px rgba(26, 29, 41, 0.15)' }}>
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1D29' }}>
                Bienvenue
              </h2>
              <p className="text-sm" style={{ color: '#7D8491' }}>
                Connectez-vous à votre compte pour continuer
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: '#F5F5F6',
                    borderColor: '#D1D2D4',
                    color: '#1A1D29'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#7D8491'
                    e.target.style.boxShadow = '0 0 0 3px rgba(125, 132, 145, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D2D4'
                    e.target.style.boxShadow = 'none'
                  }}
                  required
                  placeholder="Nom d'utilisateur"
                />
              </div>

              {/* Password Field */}
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: '#F5F5F6',
                    borderColor: '#D1D2D4',
                    color: '#1A1D29'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#7D8491'
                    e.target.style.boxShadow = '0 0 0 3px rgba(125, 132, 145, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D2D4'
                    e.target.style.boxShadow = 'none'
                  }}
                  required
                  placeholder="mot de passe"
                />
                <div className="text-right mt-2">
                  <a href="#" className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: '#7D8491' }}>
                    Mot de passe oublié ?
                  </a>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-xl border text-sm" style={{ 
                  backgroundColor: '#FEF2F2',
                  borderColor: '#FCA5A5',
                  color: '#DC2626'
                }}>
                  {error}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 text-white font-semibold rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: '#3D3F4A',
                  boxShadow: '0 8px 24px rgba(61, 63, 74, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#2D2F38'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3D3F4A'
                }}
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login