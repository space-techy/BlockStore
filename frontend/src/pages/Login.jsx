import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useGlobalContext } from '@/provider/Context'
import { Button } from '@/components/ui/button'

function Login() {
  const { connectWallet, isConnected, account, loading } = useGlobalContext()
  const navigate = useNavigate()

  const handleConnect = async () => {
    const connected = await connectWallet()
    if (connected) {
      navigate('/dashboard')
    }
  }

  React.useEffect(() => {
    if (isConnected) {
      navigate('/dashboard')
    }
  }, [isConnected, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2">BlockStore</h1>
        <p className="text-gray-600 text-center mb-8">Decentralized Cloud Storage</p>
        
        <div className="space-y-4">
          <p className="text-center text-gray-700">
            Connect your MetaMask wallet to access your files
          </p>
          
          <Button 
            onClick={handleConnect} 
            disabled={loading || isConnected}
            className="w-full"
            size="lg"
          >
            {loading ? 'Connecting...' : isConnected ? 'Connected' : 'Connect MetaMask'}
          </Button>

          {account && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">Connected Account:</p>
              <p className="text-sm font-mono text-gray-800 break-all">{account}</p>
            </div>
          )}

          {!window.ethereum && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                MetaMask is not installed. Please install{' '}
                <a 
                  href="https://metamask.io/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline font-semibold"
                >
                  MetaMask
                </a>{' '}
                to continue.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login

