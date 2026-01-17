import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Login from './components/Login'
import Header from './components/Header'
import Footer from './components/Footer' 
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './components/admin/AdminDashboard'
import StudentDashboard from './components/student/StudentDashboard'
import StudentsManagement from './components/admin/StudentsManagement'
import RequestsManagement from './components/admin/RequestsManagement'
import PaymentsManagement from './components/admin/PaymentsManagement'
import EnrollmentsManagement from './components/admin/EnrollmentsManagement'
import GradesManagement from './components/admin/GradesManagement'
import ComplaintsManagement from './components/admin/ComplaintsManagement'
import StudentProfile from './components/student/StudentProfile'
import StudentRequests from './components/student/StudentRequests'
import StudentPayments from './components/student/StudentPayments'
import StudentGrades from './components/student/StudentGrades'
import StudentComplaints from './components/student/StudentComplaints'
import StudentEnrollments from './components/student/StudentEnrollments'

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [userRole, setUserRole] = useState<string | null>(() => localStorage.getItem('userRole'))

  const handleLogin = (newToken: string, role: string) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('userRole', role)
    setToken(newToken)
    setUserRole(role)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    setToken(null)
    setUserRole(null)
  }

  const isAuthenticated = !!token
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {location.pathname !== '/login' && (
        <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} userRole={userRole} />
      )}
      <main className="flex-grow">
        <Routes>

          <Route path="/login" element={<Login onLogin={handleLogin} />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="ADMIN">
                <StudentsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/requests"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="ADMIN">
                <RequestsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="ADMIN">
                <PaymentsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/enrollments"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="ADMIN">
                <EnrollmentsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/grades"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="ADMIN">
                <GradesManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="ADMIN">
                <ComplaintsManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="ETUDIANT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="ETUDIANT">
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="ETUDIANT">
                <StudentRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="ETUDIANT">
                <StudentPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grades"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="ETUDIANT">
                <StudentGrades />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="ETUDIANT">
                <StudentComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enrollments"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} userRole={userRole} requiredRole="ETUDIANT">
                <StudentEnrollments />
              </ProtectedRoute>
            }
          />


          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
      {location.pathname !== '/login' && <Footer />}
    </div>
  )
}

export default App