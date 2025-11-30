import React, { useState, useEffect } from 'react'
import { useGlobalContext } from '@/provider/Context'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

function Dashboard() {
  const { account, isConnected } = useGlobalContext()
  const navigate = useNavigate()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isConnected) {
      navigate('/')
      return
    }

    fetchUserFiles()
  }, [isConnected, account, navigate])

  const fetchUserFiles = async () => {
    if (!account) return

    try {
      setLoading(true)
      // Use the new user endpoint that returns files where user is sender OR receiver
      const response = await fetch(`http://localhost:3000/files/user/${account}`)
      if (!response.ok) {
        throw new Error('Failed to fetch files')
      }
      const data = await response.json()
      setFiles(data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching files:', err)
      setError(err.message)
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (fileId, originalFilename) => {
    try {
      const response = await fetch(`http://localhost:3000/retrieve/${fileId}?address=${account}`)
      if (!response.ok) {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to download file')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = originalFilename || fileId
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error downloading file:', err)
      alert('Failed to download file')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAddress = (addr) => {
    if (!addr) return '-'
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getFileRole = (file) => {
    const normalizedAccount = account?.toLowerCase()
    const isSender = file.ownerAddress?.toLowerCase() === normalizedAccount
    const isReceiver = file.receiverAddress?.toLowerCase() === normalizedAccount
    
    if (isSender && isReceiver) return 'You (Sender & Receiver)'
    if (isSender) return 'You (Sender)'
    if (isReceiver) return 'You (Receiver)'
    return 'Unknown'
  }

  if (!isConnected) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Files</h1>
        <Button onClick={() => navigate('/upload')}>
          Upload New File
        </Button>
      </div>

      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading your files...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      {!loading && !error && files.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No files uploaded yet.</p>
          <Button onClick={() => navigate('/upload')}>
            Upload Your First File
          </Button>
        </div>
      )}

      {!loading && files.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filename
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Your Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Label
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Privacy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {files.map((file) => (
                <tr key={file._id || file.fileId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {file.originalFilename || file.fileId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{getFileRole(file)}</div>
                      {file.receiverAddress && (
                        <div className="text-xs text-gray-500 mt-1">
                          {file.ownerAddress?.toLowerCase() === account?.toLowerCase() 
                            ? `To: ${formatAddress(file.receiverAddress)}`
                            : `From: ${formatAddress(file.ownerAddress)}`
                          }
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{file.label || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        file.isPublic
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {file.isPublic ? 'Public' : 'Private'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(file.uploadedAt || file.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      onClick={() => handleDownload(file.fileId, file.originalFilename)}
                      size="sm"
                    >
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Dashboard

