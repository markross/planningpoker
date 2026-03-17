import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-gray-300">404</h1>
        <p className="text-gray-600">Page not found</p>
        <Link to="/">
          <Button>Go home</Button>
        </Link>
      </div>
    </div>
  )
}
