import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaSpinner } from 'react-icons/fa'

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

interface Note {
  id: number
  module: string
  valeur: number
  etudiant: Student
}

const API_BASE_URL = 'http://localhost:8080'

function GradesManagement() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    module: '',
    valeur: ''
  })

  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    if (selectedStudent) {
      fetchNotes(selectedStudent.id)
    }
  }, [selectedStudent])

  // Close suggestions when clicking outside
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
    } finally {
      setLoading(false)
    }
  }

  const fetchNotes = async (studentId: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_BASE_URL}/api/admin/etudiants/${studentId}/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotes(response.data)
    } catch (error) {
      console.error('Error fetching notes:', error)
      setErrorMessage('Erreur lors du chargement des notes.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const valeur = parseFloat(formData.valeur)
    if (isNaN(valeur) || valeur < 0 || valeur > 20) {
      setErrorMessage('La valeur doit être un nombre entre 0 et 20.')
      return
    }
    setSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')
    try {
      const token = localStorage.getItem('token')
      
      const requestData = {
        module: formData.module,
        valeur: valeur,
        etudiantId: selectedStudent!.id
      }

      console.log('Sending note data:', requestData)

      if (editingNote) {
        await axios.put(`${API_BASE_URL}/api/admin/notes/${editingNote.id}`, requestData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        setSuccessMessage('Note mise à jour avec succès !')
      } else {
        await axios.post(`${API_BASE_URL}/api/admin/notes`, requestData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        setSuccessMessage('Note ajoutée avec succès !')
      }
      
      fetchNotes(selectedStudent!.id)
      resetForm()
      
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      console.error('Error saving note:', error.response?.data || error)
      setErrorMessage(error.response?.data?.message || 'Erreur lors de la sauvegarde de la note.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setFormData({
      module: note.module,
      valeur: note.valeur.toString()
    })
    setShowForm(true)
    setSuccessMessage('')
    setErrorMessage('')
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`${API_BASE_URL}/api/admin/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setSuccessMessage('Note supprimée avec succès !')
        fetchNotes(selectedStudent!.id)
        
        setTimeout(() => setSuccessMessage(''), 3000)
      } catch (error) {
        console.error('Error deleting note:', error)
        setErrorMessage('Erreur lors de la suppression de la note.')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      module: '',
      valeur: ''
    })
    setEditingNote(null)
    setShowForm(false)
    setSuccessMessage('')
    setErrorMessage('')
  }

  const handleSearchInputChange = (value: string) => {
    setSearchInput(value)
    setShowSuggestions(value.length > 0)
  }

  const handleSuggestionClick = (student: Student) => {
    setSelectedStudent(student)
    setSearchInput(`${student.prenom} ${student.nom}`)
    setShowSuggestions(false)
    setNotes([])
    setShowForm(false)
    setSuccessMessage('')
    setErrorMessage('')
  }

  const getSuggestions = () => {
    if (!searchInput.trim()) return []
    
    return students.filter(student =>
      student.nom.toLowerCase().includes(searchInput.toLowerCase()) ||
      student.prenom.toLowerCase().includes(searchInput.toLowerCase()) ||
      student.codeApogee.toString().includes(searchInput)
    ).slice(0, 5) // Limit to 5 suggestions
  }

  const filteredStudents = students.filter(student =>
    student.nom.toLowerCase().includes(searchInput.toLowerCase()) ||
    student.prenom.toLowerCase().includes(searchInput.toLowerCase()) ||
    student.codeApogee.toString().includes(searchInput)
  )

  const suggestions = getSuggestions()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8E9EA' }}>
        <div className="flex items-center space-x-3">
          <FaSpinner className="animate-spin text-2xl" style={{ color: '#3D3F4A' }} />
          <span style={{ color: '#3D3F4A' }}>Chargement des étudiants...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 " style={{ backgroundColor: '#E8E9EA' }}>
      {submitting && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(26, 29, 41, 0.7)' }}>
          <div className="bg-white p-6 rounded-xl shadow-2xl flex items-center space-x-4">
            <FaSpinner className="animate-spin text-2xl" style={{ color: '#3D3F4A' }} />
            <span style={{ color: '#1A1D29' }}>Sauvegarde en cours...</span>
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
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1A1D29' }}>Gestion des Notes</h1>
          <p style={{ color: '#7D8491' }}>Gérer les notes des étudiants</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <label className="block text-sm font-bold mb-3" style={{ color: '#1A1D29' }}>
            Sélectionner un Étudiant
          </label>
          
          {/* Search Input with Autocomplete */}
          <div ref={searchRef} className="relative mb-4">
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

            {/* Suggestions Dropdown */}
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

            {showSuggestions && suggestions.length === 0 && searchInput.trim() && (
              <div 
                className="absolute z-10 w-full mt-2 rounded-xl shadow-2xl border p-4"
                style={{ 
                  backgroundColor: 'white',
                  borderColor: '#D1D2D4'
                }}
              >
                <p className="text-sm text-center" style={{ color: '#7D8491' }}>
                  Aucun étudiant trouvé pour "{searchInput}"
                </p>
              </div>
            )}
          </div>

          {/* Dropdown Select */}
          <select
            value={selectedStudent?.id || ''}
            onChange={(e) => {
              const student = students.find(s => s.id === parseInt(e.target.value))
              setSelectedStudent(student || null)
              if (student) {
                setSearchInput(`${student.prenom} ${student.nom}`)
              }
              setNotes([])
              setShowForm(false)
              setSuccessMessage('')
              setErrorMessage('')
            }}
            className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
            style={{ 
              backgroundColor: '#F5F5F6',
              borderColor: '#D1D2D4',
              color: '#1A1D29'
            }}
          >
            <option value="">-- Sélectionner un étudiant --</option>
            {filteredStudents.map(student => (
              <option key={student.id} value={student.id}>
                {student.prenom} {student.nom}
              </option>
            ))}
          </select>
          {filteredStudents.length === 0 && searchInput && (
            <p className="mt-2 text-sm" style={{ color: '#7D8491' }}>
              Aucun étudiant trouvé pour "{searchInput}"
            </p>
          )}
        </div>

        {selectedStudent && (
          <>
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
                <span>Ajouter une Note</span>
              </button>
            )}

            {showForm && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A1D29' }}>
                  {editingNote ? 'Modifier la Note' : 'Ajouter une Nouvelle Note'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#1A1D29' }}>
                        Module *
                      </label>
                      <input
                        type="text"
                        value={formData.module}
                        onChange={(e) => setFormData({...formData, module: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                        style={{ 
                          backgroundColor: '#F5F5F6',
                          borderColor: '#D1D2D4',
                          color: '#1A1D29'
                        }}
                        placeholder="Ex: Python, Java..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: '#1A1D29' }}>
                        Note (0-20) *
                      </label>
                      <input
                        type="number"
                        value={formData.valeur}
                        onChange={(e) => setFormData({...formData, valeur: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2"
                        style={{ 
                          backgroundColor: '#F5F5F6',
                          borderColor: '#D1D2D4',
                          color: '#1A1D29'
                        }}
                        placeholder="Ex: 15.5"
                        min="0"
                        max="20"
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
                      {editingNote ? 'Mettre à Jour' : 'Ajouter'}
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

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead style={{ backgroundColor: '#F5F5F6' }}>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                        Module
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                        Note
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: '#3D3F4A' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#E8E9EA' }}>
                    {notes.map((note) => (
                      <tr key={note.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium" style={{ color: '#1A1D29' }}>
                          {note.module}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#3D3F4A' }}>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold" style={{
                            backgroundColor: note.valeur >= 10 ? '#D1FAE5' : '#FEE2E2',
                            color: note.valeur >= 10 ? '#065F46' : '#991B1B'
                          }}>
                            {note.valeur.toFixed(2)}/20
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(note)}
                            className="mr-4 p-2 rounded-lg transition-all hover:bg-blue-50"
                            style={{ color: '#3B82F6' }}
                            title="Modifier"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(note.id)}
                            className="p-2 rounded-lg transition-all hover:bg-red-50"
                            style={{ color: '#EF4444' }}
                            title="Supprimer"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {notes.length === 0 && (
                <div className="text-center py-12" style={{ color: '#7D8491' }}>
                  <p className="text-lg">Aucune note trouvée pour cet étudiant.</p>
                  <p className="text-sm mt-2">Cliquez sur "Ajouter une Note" pour commencer.</p>
                </div>
              )}
            </div>
          </>
        )}

        {!selectedStudent && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="mb-4" style={{ color: '#7D8491' }}>
              <FaSearch className="mx-auto text-5xl mb-4" />
              <p className="text-lg">Veuillez sélectionner un étudiant pour voir et gérer ses notes.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GradesManagement