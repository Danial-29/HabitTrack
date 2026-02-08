import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Hydration from './pages/Hydration'
import Sleep from './pages/Sleep'
import Habits from './pages/Habits'
import Settings from './pages/Settings'
import Stats from './pages/Stats'
import HydrationHistory from './pages/HydrationHistory'
import Auth from './pages/Auth'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Route */}
          <Route path="/auth" element={<Auth />} />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/hydration" element={
            <ProtectedRoute>
              <Hydration />
            </ProtectedRoute>
          } />
          <Route path="/hydration/history" element={
            <ProtectedRoute>
              <HydrationHistory />
            </ProtectedRoute>
          } />
          <Route path="/sleep" element={
            <ProtectedRoute>
              <Sleep />
            </ProtectedRoute>
          } />
          <Route path="/habits" element={
            <ProtectedRoute>
              <Habits />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/stats" element={
            <ProtectedRoute>
              <Stats />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
