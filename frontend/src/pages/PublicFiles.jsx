import React, { useState, useEffect } from 'react'
import { useGlobalContext } from '@/provider/Context'
import { Button } from '@/components/ui/button'

function PublicFiles() {
  const { account } = useGlobalContext()
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAllPublicFiles()
  }, [])

  const fetchAllPublicFiles = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('http://localhost:3000/files/public/all')
      if (!response.ok) {
        throw new Error('Failed to fetch public files')
      }

      const data = await response.json()
      setFiles(data || [])
    } catch (err) {
      console.error('Error fetching public files:', err)
      setError(err.message || 'Failed to fetch files')
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (fileId, originalFilename) => {
    try {
      // Pass address for access control - even for public files, we want to log who accessed
      const address = account || 'anonymous'
      const response = await fetch(`http://localhost:3000/retrieve/${fileId}?address=${address}`)
      if (!response.ok) {
        const errorData = await response.json()
        
        // Show detailed error message
        let errorMsg = errorData.error || 'Failed to download file'
        if (errorData.requiredRoles && errorData.requiredRoles.length > 0) {
          errorMsg += `\n\nRequired roles: ${errorData.requiredRoles.join(', ')}`
        }
        
        alert(errorMsg)
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Public Files</h1>
          <p className="text-gray-600 mt-2">
            Browse all publicly available files on the blockchain
          </p>
        </div>
        <Button onClick={fetchAllPublicFiles} variant="outline">
          Refresh
        </Button>
      </div>

      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading public files...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      {!loading && !error && files.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            No public files available yet.
          </p>
        </div>
      )}

      {!loading && files.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold">
              {files.length} Public File{files.length !== 1 ? 's' : ''} Available
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filename
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    To Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Label
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
                      <div className="text-sm font-mono text-gray-600">
                        {formatAddress(file.ownerAddress)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-600">
                        {file.receiverAddress ? formatAddress(file.receiverAddress) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{file.label || '-'}</div>
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
        </div>
      )}
    </div>
  )
}

export default PublicFiles
