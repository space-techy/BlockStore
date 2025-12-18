import React, { useState, useEffect } from 'react'
import { useGlobalContext } from '@/provider/Context'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

function Dashboard() {
  const { account, isConnected } = useGlobalContext()
  const navigate = useNavigate()
  const [files, setFiles] = useState([])
  const [userRoles, setUserRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isConnected) {
      navigate('/')
      return
    }

    fetchUserFiles()
    fetchUserRoles()
  }, [isConnected, account, navigate])

  const fetchUserRoles = async () => {
    if (!account) return
    
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d4af8db5-c6fb-42a5-8e54-2477ade9b0a4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:24',message:'fetchUserRoles entry',data:{account},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      const response = await fetch(`http://localhost:4000/user-roles/${account}`)
      if (response.ok) {
        const data = await response.json()
        const roleNames = data.map(ur => ur.roleName)
        setUserRoles(roleNames)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/d4af8db5-c6fb-42a5-8e54-2477ade9b0a4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:32',message:'fetchUserRoles success',data:{roleNames,count:roleNames.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.log('User roles:', roleNames)
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/d4af8db5-c6fb-42a5-8e54-2477ade9b0a4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:35',message:'fetchUserRoles failed',data:{status:response.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
      }
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d4af8db5-c6fb-42a5-8e54-2477ade9b0a4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:37',message:'fetchUserRoles error',data:{error:err.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      console.error('Error fetching user roles:', err)
      setUserRoles([])
    }
  }

  const fetchUserFiles = async () => {
    if (!account) return

    try {
      setLoading(true)
      // Use the accessible endpoint that includes role-based access
      const response = await fetch(`http://localhost:3000/files/accessible/${account}`)
      if (!response.ok) {
        throw new Error('Failed to fetch files')
      }
      const data = await response.json()
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d4af8db5-c6fb-42a5-8e54-2477ade9b0a4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:52',message:'files fetched',data:{count:data?.length,files:data?.map(f=>({fileId:f.fileId,isPublic:f.isPublic,accessType:f.accessType,allowedRoles:f.allowedRoles}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C,D'})}).catch(()=>{});
      // #endregion
      console.log('Fetched accessible files:', data)
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

  const getFileRole = (file) => {
    const normalizedAccount = account?.toLowerCase()
    const isSender = file.ownerAddress?.toLowerCase() === normalizedAccount
    const isReceiver = file.receiverAddress?.toLowerCase() === normalizedAccount
    
    if (isSender && isReceiver) return 'You (Sender & Receiver)'
    if (isSender) return 'You (Sender)'
    if (isReceiver) return 'You (Receiver)'
    
    // For role-based files, show role information
    if (file.accessType === 'role-based' && file.allowedRoles?.length > 0) {
      const hasRole = file.allowedRoles.some(role => userRoles.includes(role))
      if (hasRole) {
        const matchingRoles = file.allowedRoles.filter(role => userRoles.includes(role))
        return `You (Role: ${matchingRoles.join(', ')})`
      } else {
        return `No Access (Requires: ${file.allowedRoles.join(', ')})`
      }
    }
    
    return 'Unknown'
  }

  const canDownloadFile = (file) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d4af8db5-c6fb-42a5-8e54-2477ade9b0a4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:134',message:'canDownloadFile entry',data:{fileId:file.fileId,isPublic:file.isPublic,accessType:file.accessType,allowedRoles:file.allowedRoles,userRoles,ownerAddress:file.ownerAddress?.slice(0,10)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C,D'})}).catch(()=>{});
    // #endregion
    if (!account) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d4af8db5-c6fb-42a5-8e54-2477ade9b0a4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:136',message:'canDownloadFile no account',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return false
    }
    
    const normalizedAccount = account.toLowerCase()
    const isOwner = file.ownerAddress?.toLowerCase() === normalizedAccount
    const isReceiver = file.receiverAddress?.toLowerCase() === normalizedAccount
    
    // Owner and receiver can always download
    if (isOwner || isReceiver) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d4af8db5-c6fb-42a5-8e54-2477ade9b0a4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:143',message:'canDownloadFile owner/receiver',data:{isOwner,isReceiver},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return true
    }
    
    // For role-based files, check if user has required role FIRST (before public check)
    if (file.accessType === 'role-based' && file.allowedRoles && file.allowedRoles.length > 0) {
      const hasRequiredRole = file.allowedRoles.some(role => userRoles.includes(role))
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d4af8db5-c6fb-42a5-8e54-2477ade9b0a4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:151',message:'canDownloadFile role-based check',data:{hasRequiredRole,allowedRoles:file.allowedRoles,userRoles},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C,D'})}).catch(()=>{});
      // #endregion
      return hasRequiredRole
    }
    
    // Public files can be downloaded by anyone (only if not role-based)
    if (file.isPublic) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d4af8db5-c6fb-42a5-8e54-2477ade9b0a4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:156',message:'canDownloadFile public check',data:{isPublic:file.isPublic},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return true
    }
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d4af8db5-c6fb-42a5-8e54-2477ade9b0a4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:160',message:'canDownloadFile denied',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // Private files without owner/receiver access cannot be downloaded
    return false
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
                    {(() => {
                      const canDownload = canDownloadFile(file);
                      // #region agent log
                      fetch('http://127.0.0.1:7242/ingest/d4af8db5-c6fb-42a5-8e54-2477ade9b0a4',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Dashboard.jsx:260',message:'render download button',data:{fileId:file.fileId,canDownload,accessType:file.accessType,isPublic:file.isPublic},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C,D'})}).catch(()=>{});
                      // #endregion
                      return canDownload ? (
                        <Button
                          onClick={() => handleDownload(file.fileId, file.originalFilename)}
                          size="sm"
                        >
                          Download
                        </Button>
                      ) : (
                        <div className="text-xs text-gray-400">
                          {file.accessType === 'role-based' && file.allowedRoles?.length > 0 ? (
                            <span title={`Requires role: ${file.allowedRoles.join(', ')}`}>
                              No Access
                            </span>
                          ) : (
                            <span>No Access</span>
                          )}
                        </div>
                      );
                    })()}
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

