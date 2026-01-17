import { useState, useEffect } from 'react'
import axios from 'axios'
import { FaSpinner, FaGraduationCap, FaChartLine } from 'react-icons/fa'

interface Grade {
  id: number
  module: string
  valeur: number
  etudiantId: number
}

const API_BASE_URL = 'http://localhost:8080'

function StudentGrades() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchGrades()
  }, [])

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/api/etudiant/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setGrades(response.data)
    } catch (error) {
      console.error('Error fetching grades:', error)
      setErrorMessage('Erreur lors du chargement des notes.')
    } finally {
      setLoading(false)
    }
  }

  const calculateAverage = () => {
    if (grades.length === 0) return 0
    const sum = grades.reduce((acc, grade) => acc + grade.valeur, 0)
    return (sum / grades.length).toFixed(2)
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return { bg: '#D1FAE5', color: '#065F46' }
    if (grade >= 14) return { bg: '#DBEAFE', color: '#1E40AF' }
    if (grade >= 12) return { bg: '#E0E7FF', color: '#3730A3' }
    if (grade >= 10) return { bg: '#FEF3C7', color: '#92400E' }
    return { bg: '#FEE2E2', color: '#991B1B' }
  }

  const getGradeLabel = (grade: number) => {
    if (grade >= 16) return 'Excellent'
    if (grade >= 14) return 'Très Bien'
    if (grade >= 12) return 'Bien'
    if (grade >= 10) return 'Assez Bien'
    return 'Insuffisant'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8E9EA' }}>
        <div className="flex items-center space-x-3">
          <FaSpinner className="animate-spin text-2xl" style={{ color: '#3D3F4A' }} />
          <span style={{ color: '#3D3F4A' }}>Chargement des notes...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#E8E9EA' }}>
      <div className="max-w-7xl mx-auto">
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
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1A1D29' }}>Mes Notes</h1>
          <p style={{ color: '#7D8491' }}>Consulter vos résultats académiques</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#7D8491' }}>Nombre de Modules</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#1A1D29' }}>{grades.length}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: '#E0E7FF' }}>
                <FaGraduationCap className="text-2xl" style={{ color: '#3730A3' }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#7D8491' }}>Moyenne Générale</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#10B981' }}>{calculateAverage()}/20</p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: '#D1FAE5' }}>
                <FaChartLine className="text-2xl" style={{ color: '#065F46' }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#7D8491' }}>Modules Validés</p>
                <p className="text-3xl font-bold mt-2" style={{ color: '#3730A3' }}>
                  {grades.filter(g => g.valeur >= 10).length}/{grades.length}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: '#DBEAFE' }}>
                <FaGraduationCap className="text-2xl" style={{ color: '#1E40AF' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Grades Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: '#F5F5F6' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Module
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Note
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Appréciation
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#E8E9EA' }}>
                {grades.map((grade) => {
                  const colors = getGradeColor(grade.valeur)
                  return (
                    <tr key={grade.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.bg }}>
                            <FaGraduationCap style={{ color: colors.color }} />
                          </div>
                          <div className="ml-4">
                            <div className="font-semibold" style={{ color: '#1A1D29' }}>
                              {grade.module}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-lg font-bold" style={{
                          backgroundColor: colors.bg,
                          color: colors.color
                        }}>
                          {grade.valeur.toFixed(2)}/20
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-medium" style={{ color: colors.color }}>
                          {getGradeLabel(grade.valeur)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" style={{
                          backgroundColor: grade.valeur >= 10 ? '#D1FAE5' : '#FEE2E2',
                          color: grade.valeur >= 10 ? '#065F46' : '#991B1B'
                        }}>
                          {grade.valeur >= 10 ? 'Validé' : 'Non Validé'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {grades.length === 0 && (
            <div className="text-center py-12" style={{ color: '#7D8491' }}>
              <FaGraduationCap className="mx-auto text-5xl mb-4" />
              <p className="text-lg">Aucune note disponible.</p>
              <p className="text-sm mt-2">Vos notes apparaîtront ici une fois qu'elles seront saisies par l'administration.</p>
            </div>
          )}
        </div>

        {/* Grade Distribution */}
        {grades.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A1D29' }}>
              Répartition des Notes
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium" style={{ color: '#1A1D29' }}>Excellent (16-20)</span>
                  <span className="font-bold" style={{ color: '#065F46' }}>
                    {grades.filter(g => g.valeur >= 16).length} modules
                  </span>
                </div>
                <div className="w-full h-3 rounded-full" style={{ backgroundColor: '#F5F5F6' }}>
                  <div 
                    className="h-3 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${(grades.filter(g => g.valeur >= 16).length / grades.length) * 100}%`,
                      backgroundColor: '#10B981'
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium" style={{ color: '#1A1D29' }}>Très Bien (14-16)</span>
                  <span className="font-bold" style={{ color: '#1E40AF' }}>
                    {grades.filter(g => g.valeur >= 14 && g.valeur < 16).length} modules
                  </span>
                </div>
                <div className="w-full h-3 rounded-full" style={{ backgroundColor: '#F5F5F6' }}>
                  <div 
                    className="h-3 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${(grades.filter(g => g.valeur >= 14 && g.valeur < 16).length / grades.length) * 100}%`,
                      backgroundColor: '#3B82F6'
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium" style={{ color: '#1A1D29' }}>Bien (12-14)</span>
                  <span className="font-bold" style={{ color: '#3730A3' }}>
                    {grades.filter(g => g.valeur >= 12 && g.valeur < 14).length} modules
                  </span>
                </div>
                <div className="w-full h-3 rounded-full" style={{ backgroundColor: '#F5F5F6' }}>
                  <div 
                    className="h-3 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${(grades.filter(g => g.valeur >= 12 && g.valeur < 14).length / grades.length) * 100}%`,
                      backgroundColor: '#6366F1'
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium" style={{ color: '#1A1D29' }}>Assez Bien (10-12)</span>
                  <span className="font-bold" style={{ color: '#92400E' }}>
                    {grades.filter(g => g.valeur >= 10 && g.valeur < 12).length} modules
                  </span>
                </div>
                <div className="w-full h-3 rounded-full" style={{ backgroundColor: '#F5F5F6' }}>
                  <div 
                    className="h-3 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${(grades.filter(g => g.valeur >= 10 && g.valeur < 12).length / grades.length) * 100}%`,
                      backgroundColor: '#F59E0B'
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium" style={{ color: '#1A1D29' }}>Insuffisant (&lt;10)</span>
                  <span className="font-bold" style={{ color: '#991B1B' }}>
                    {grades.filter(g => g.valeur < 10).length} modules
                  </span>
                </div>
                <div className="w-full h-3 rounded-full" style={{ backgroundColor: '#F5F5F6' }}>
                  <div 
                    className="h-3 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${(grades.filter(g => g.valeur < 10).length / grades.length) * 100}%`,
                      backgroundColor: '#EF4444'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentGrades