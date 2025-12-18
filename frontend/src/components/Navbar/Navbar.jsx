import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGlobalContext } from '@/provider/Context'
import { Button } from '@/components/ui/button'

function Navbar() {
  const { account, isConnected, disconnectWallet } = useGlobalContext()
  const navigate = useNavigate()

  const handleDisconnect = () => {
    disconnectWallet()
    navigate('/')
  }

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              BlockStore
            </Link>
            {isConnected && (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 transition">
                  My Files
                </Link>
                <Link to="/upload" className="text-gray-700 hover:text-indigo-600 transition">
                  Upload
                </Link>
                <Link to="/public-files" className="text-gray-700 hover:text-indigo-600 transition">
                  Public Files
                </Link>
                <Link to="/verify" className="text-gray-700 hover:text-indigo-600 transition">
                  Verify
                </Link>
                <Link to="/admin" className="text-gray-700 hover:text-indigo-600 transition">
                  Admin
                </Link>
              </>
            )}
          </div>

          {isConnected ? (
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-gray-100 rounded-lg">
                <span className="text-sm font-mono text-gray-700">
                  {formatAddress(account)}
                </span>
              </div>
              <Button onClick={handleDisconnect} variant="outline">
                Disconnect
              </Button>
            </div>
          ) : (
            <Link to="/">
              <Button>Connect Wallet</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
