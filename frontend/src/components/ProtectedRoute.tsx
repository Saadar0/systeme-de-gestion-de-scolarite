import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
  isAuthenticated: boolean
  userRole: string | null
}

function ProtectedRoute({ children, requiredRole, isAuthenticated, userRole }: ProtectedRouteProps) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && userRole !== requiredRole) {
    // If user is authenticated but doesn't have the right role
    if (userRole === 'ADMIN') {
      return <Navigate to="/admin" replace />
    } else {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute