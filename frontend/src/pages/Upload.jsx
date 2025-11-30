import React, { useState } from 'react'
import { useGlobalContext } from '@/provider/Context'
import { useNavigate } from 'react-router-dom'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

function Upload() {
  const { account, isConnected } = useGlobalContext()
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [senderAddress, setSenderAddress] = useState('')
  const [receiverAddress, setReceiverAddress] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  React.useEffect(() => {
    if (!isConnected) {
      navigate('/')
    }
  }, [isConnected, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }

    if (!senderAddress.trim()) {
      setError('Please enter a sender address (your wallet address)')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setMessage(null)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('senderAddress', senderAddress.trim())
      formData.append('isPublic', isPublic.toString())
      if (receiverAddress.trim()) {
        formData.append('receiverAddress', receiverAddress.trim())
      }
      if (label.trim()) {
        formData.append('label', label.trim())
      }

      const response = await fetch('http://localhost:3000/store', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setMessage('File uploaded successfully!')
      setFile(null)
      setLabel('')
      setSenderAddress('')
      setReceiverAddress('')
      setIsPublic(false)
      
      // Reset file input
      const fileInput = document.getElementById('file')
      if (fileInput) fileInput.value = ''

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload file')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (account) {
      setSenderAddress(account)
    }
  }, [account])

  if (!isConnected) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Upload File</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div>
          <Label htmlFor="file">Select File</Label>
          <Input
            id="file"
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="mt-1"
            disabled={loading}
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="senderAddress">Sender Address (Your Wallet Address)</Label>
          <Input
            id="senderAddress"
            type="text"
            value={senderAddress}
            onChange={(e) => setSenderAddress(e.target.value)}
            placeholder="0x..."
            className="mt-1 font-mono"
            disabled={loading}
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            This address will be used as the file owner address (sender)
          </p>
        </div>

        <div>
          <Label htmlFor="receiverAddress">Receiver Address (Optional)</Label>
          <Input
            id="receiverAddress"
            type="text"
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
            placeholder="0x... (leave empty if not sending to anyone specific)"
            className="mt-1 font-mono"
            disabled={loading}
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter a wallet address if you want to send this file to someone. The receiver will be able to see this file in their dashboard.
          </p>
        </div>

        <div>
          <Label htmlFor="label">Label (Optional)</Label>
          <Input
            id="label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g., delivery_address"
            className="mt-1"
            disabled={loading}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="isPublic"
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            disabled={loading}
          />
          <Label htmlFor="isPublic" className="cursor-pointer">
            Make this file public (anyone with your address can access it)
          </Label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">{message}</p>
          </div>
        )}

        <div className="flex space-x-4">
          <Button
            type="submit"
            disabled={loading || !file || !senderAddress}
            className="flex-1"
          >
            {loading ? 'Uploading...' : 'Upload File'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard')}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

export default Upload

