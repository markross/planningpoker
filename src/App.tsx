import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { HomePage } from './pages/HomePage'
import { SessionPage } from './pages/SessionPage'
import { NotFoundPage } from './pages/NotFoundPage'
import './app.css'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/session/:sessionCode" element={<SessionPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
