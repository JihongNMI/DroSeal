import { Link } from 'react-router-dom'
import logo from '../assets/logo.svg'

export default function Home(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <img 
          src={logo} 
          alt="DroSeal Logo" 
          className="w-24 h-24 mx-auto mb-6"
        />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to DroSeal
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Modern React application with Vite, TypeScript, and Tailwind CSS
        </p>
        
        {/* MVP Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <Link 
            to="/encyclopedia" 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Encyclopedia</h2>
            <p className="text-gray-600">View your collection in card format</p>
          </Link>
          
          <Link 
            to="/inventory" 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Inventory</h2>
            <p className="text-gray-600">Manage individual items</p>
          </Link>
          
          <Link 
            to="/accounting" 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Accounting</h2>
            <p className="text-gray-600">Track finances and transactions</p>
          </Link>
          
          <Link 
            to="/mypage" 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">My Page</h2>
            <p className="text-gray-600">Profile and friends</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
