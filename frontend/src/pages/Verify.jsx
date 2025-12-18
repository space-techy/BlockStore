import React, { useState, useEffect } from 'react'
import { useGlobalContext } from '@/provider/Context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function Verify() {
  const { account, isConnected } = useGlobalContext()
  const [file, setFile] = useState(null)
  const [selectedFileId, setSelectedFileId] = useState('')
  const [manualFileId, setManualFileId] = useState('')
  const [calculatedHash, setCalculatedHash] = useState('')
  const [verificationResult, setVerificationResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [accessibleFiles, setAccessibleFiles] = useState([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [useManualEntry, setUseManualEntry] = useState(false)

  useEffect(() => {
    if (isConnected && account) {
      fetchAccessibleFiles()
    }
  }, [isConnected, account])

  const fetchAccessibleFiles = async () => {
    if (!account) return
    
    try {
      setLoadingFiles(true)
      // Try to get accessible files (includes role-based access)
      const response = await fetch(`http://localhost:3000/files/accessible/${account}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Accessible files:', data)
        setAccessibleFiles(data)
      } else {
        console.error('Failed to fetch accessible files:', response.status)
        // Fallback to user files if accessible endpoint fails
        const userResponse = await fetch(`http://localhost:3000/files/user/${account}`)
        if (userResponse.ok) {
          const userData = await userResponse.json()
          console.log('User files:', userData)
          setAccessibleFiles(userData)
        }
      }
    } catch (err) {
      console.error('Error fetching files:', err)
      // Try user files as fallback
      try {
        const userResponse = await fetch(`http://localhost:3000/files/user/${account}`)
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setAccessibleFiles(userData)
        }
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr)
      }
    } finally {
      setLoadingFiles(false)
    }
  }

  const calculateFileHash = async (file) => {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  }

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      setVerificationResult(null)
      
      try {
        const hash = await calculateFileHash(selectedFile)
        setCalculatedHash(hash)
      } catch (err) {
        console.error('Error calculating hash:', err)
        setError('Failed to calculate file hash')
      }
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    
    const fileId = useManualEntry ? manualFileId : selectedFileId
    
    if (!fileId || !calculatedHash) {
      setError('Please select/enter file ID and select a file to verify')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setVerificationResult(null)
      
      const response = await fetch('http://localhost:3000/files/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          fileHash: calculatedHash
        })
      })
      
      if (!response.ok) {
        throw new Error('Verification failed')
      }
      
      const data = await response.json()
      setVerificationResult(data)
    } catch (err) {
      console.error('Verification error:', err)
      setError(err.message || 'Failed to verify file')
    } finally {
      setLoading(false)
    }
  }

  const handleGetAccessLogs = async () => {
    const fileId = useManualEntry ? manualFileId : selectedFileId
    
    if (!fileId) {
      setError('Please select/enter a file ID')
      return
    }

    try {
      const response = await fetch(`http://localhost:4000/access-log/file/${fileId}`)
      if (response.ok) {
        const logs = await response.json()
        console.log('Access Logs:', logs)
        alert(`Found ${logs.length} access log entries. Check console for details.`)
      } else {
        throw new Error('Failed to fetch access logs')
      }
    } catch (err) {
      console.error('Error fetching access logs:', err)
      alert('Failed to fetch access logs')
    }
  }

  const formatAddress = (addr) => {
    if (!addr) return '-'
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Document Verification</h1>
      <p className="text-gray-600 mb-6">
        Verify document integrity and authenticity using blockchain-stored hashes.
        This ensures non-repudiation and proves that the document hasn't been tampered with.
      </p>

      <form onSubmit={handleVerify} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        <div>
          <div className="flex items-center space-x-4 mb-4">
            <Label>File Selection Method:</Label>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="selectFromList"
                checked={!useManualEntry}
                onChange={() => setUseManualEntry(false)}
                className="h-4 w-4"
              />
              <Label htmlFor="selectFromList" className="cursor-pointer">
                Select from accessible files
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="manualEntry"
                checked={useManualEntry}
                onChange={() => setUseManualEntry(true)}
                className="h-4 w-4"
              />
              <Label htmlFor="manualEntry" className="cursor-pointer">
                Enter manually
              </Label>
            </div>
          </div>

          {!useManualEntry ? (
            <div>
              <Label htmlFor="fileSelect">Select File from Accessible Files</Label>
              {loadingFiles ? (
                <p className="text-sm text-gray-500 mt-2">Loading files...</p>
              ) : accessibleFiles.length === 0 ? (
                <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800 mb-2">
                    <strong>No accessible files found.</strong>
                  </p>
                  <p className="text-xs text-yellow-700">
                    This could mean:
                  </p>
                  <ul className="text-xs text-yellow-700 list-disc list-inside ml-2 mt-1">
                    <li>You haven't uploaded any files yet</li>
                    <li>No files have been shared with you</li>
                    <li>You don't have role-based access to any files</li>
                  </ul>
                  <button
                    type="button"
                    onClick={fetchAccessibleFiles}
                    className="mt-3 text-xs text-yellow-800 underline hover:text-yellow-900"
                  >
                    Refresh file list
                  </button>
                </div>
              ) : (
                <select
                  id="fileSelect"
                  value={selectedFileId}
                  onChange={(e) => setSelectedFileId(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                  required={!useManualEntry}
                >
                  <option value="">-- Select a file --</option>
                  {accessibleFiles.map((file) => (
                    <option key={file.fileId} value={file.fileId}>
                      {file.originalFilename} 
                      {file.documentType && ` (${file.documentType})`}
                      {file.isPublic ? ' [Public]' : ' [Private]'}
                      {file.allowedRoles?.length > 0 && ` [Role-Based]`}
                    </option>
                  ))}
                </select>
              )}
              {selectedFileId && (
                <div className="mt-2 p-3 bg-blue-50 rounded text-sm">
                  <p><strong>Selected File ID:</strong> <span className="font-mono text-xs">{selectedFileId}</span></p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <Label htmlFor="manualFileId">Enter File ID Manually</Label>
              <Input
                id="manualFileId"
                value={manualFileId}
                onChange={(e) => setManualFileId(e.target.value)}
                placeholder="Enter the full file ID (e.g., 1734521234567_document.pdf)"
                className="mt-1 font-mono text-sm"
                required={useManualEntry}
              />
              <p className="mt-1 text-xs text-gray-500">
                File IDs look like: timestamp_filename (e.g., 1734521234567_contract.pdf)
              </p>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="file">Upload the Actual File to Verify</Label>
          <Input
            id="file"
            type="file"
            onChange={handleFileSelect}
            required
            className="mt-1"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Upload the original file - we'll calculate its hash and compare with the blockchain record
          </p>
        </div>

        {calculatedHash && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <Label>Calculated File Hash (SHA-256):</Label>
            <p className="mt-2 text-xs font-mono break-all text-gray-700">{calculatedHash}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="flex space-x-4">
          <Button 
            type="submit" 
            disabled={loading || !file || (!selectedFileId && !manualFileId)} 
            className="flex-1"
          >
            {loading ? 'Verifying...' : 'Verify Document'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleGetAccessLogs}
            disabled={!selectedFileId && !manualFileId}
          >
            View Access Logs
          </Button>
        </div>
      </form>

      {verificationResult && (
        <div className={`mt-6 p-6 rounded-lg shadow-md ${
          verificationResult.isValid 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <h2 className="text-xl font-semibold mb-4">
            {verificationResult.isValid ? '✓ Verification Successful' : '✗ Verification Failed'}
          </h2>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Status:</p>
              <p className={`text-lg ${verificationResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
                {verificationResult.message}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700">File ID:</p>
              <p className="text-sm font-mono">{verificationResult.fileId}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700">Stored Hash (Blockchain):</p>
              <p className="text-xs font-mono break-all text-gray-600">{verificationResult.storedHash}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700">Provided Hash (Your File):</p>
              <p className="text-xs font-mono break-all text-gray-600">{verificationResult.providedHash}</p>
            </div>

            {verificationResult.isValid && (
              <div className="mt-4 p-4 bg-white rounded border border-green-300">
                <p className="text-sm text-gray-700">
                  <strong>Non-Repudiation Guarantee:</strong> This document's integrity has been verified against 
                  the hash stored on the blockchain. The document has not been altered since it was uploaded.
                </p>
              </div>
            )}

            {!verificationResult.isValid && (
              <div className="mt-4 p-4 bg-white rounded border border-red-300">
                <p className="text-sm text-red-700">
                  <strong>Warning:</strong> This document's hash does not match the blockchain record. 
                  The document may have been tampered with or this is not the original file.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Understanding File IDs</h3>
        <p className="text-sm text-blue-800 mb-3">
          When you upload a file, the system generates a unique <strong>File ID</strong> that looks like:
          <code className="block mt-2 p-2 bg-white rounded text-xs">1734521234567_contract.pdf</code>
        </p>
        <p className="text-sm text-blue-800 mb-3">
          This consists of:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 ml-4">
          <li><strong>Timestamp</strong> (1734521234567) - Ensures uniqueness</li>
          <li><strong>Original filename</strong> (contract.pdf) - Your file's name</li>
        </ul>
        
        <h3 className="font-semibold text-blue-900 mt-4 mb-2">How Verification Works</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>When a document is uploaded, its SHA-256 hash is calculated and stored on the blockchain</li>
          <li>To verify, select the file from your list (or enter the File ID manually)</li>
          <li>Upload the actual document - we calculate its current hash</li>
          <li>We compare your document's hash with the blockchain-stored hash</li>
          <li>If they match, the document is authentic and hasn't been tampered with</li>
          <li>All access attempts are logged for non-repudiation purposes</li>
        </ol>
      </div>
    </div>
  )
}

export default Verify
