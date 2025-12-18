import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { create } from 'ipfs-http-client'
import axios from 'axios'
import { fileURLToPath } from 'url'
import { storeOnChain } from './blockchain.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const PORT = 3000
const IPFS_ENABLED = false
const METADATA_SERVICE_URL = process.env.METADATA_SERVICE_URL || 'http://localhost:4000'
const LOCAL_UPLOAD_DIR = path.join(__dirname, 'uploads')
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR)
}

let ipfs
if (IPFS_ENABLED) {
  ipfs = create({ host: 'localhost', port: '5001', protocol: 'http' })
}

const ENCRYPTION_KEY = Buffer.from('12345678901234567890123456789012')

// Calculate SHA-256 hash of buffer
function calculateHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

function encryptBuffer(buffer) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)
  const encryptedData = Buffer.concat([cipher.update(buffer), cipher.final()])
  return { iv, encryptedData }
}

function decryptBuffer(encryptedBuffer, iv) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv)
  return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()])
}
function levelPriority(level) {
  switch (level) {
    case 'Always': return 3
    case 'Usually': return 2
    case 'Sometimes': return 1
    default: return 0
  }
}

const upload = multer({ storage: multer.memoryStorage() })

app.post('/store', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    const { 
      attention, confidence, label, accessRights, 
      ownerAddress, senderAddress, receiverAddress, 
      isPublic, accessType, allowedRoles,
      documentType, description, imageHash
    } = req.body
    
    // Use senderAddress as ownerAddress if provided, otherwise use ownerAddress
    const fileOwner = senderAddress || ownerAddress
    if (!fileOwner) {
      return res.status(400).json({ error: 'ownerAddress or senderAddress is required' })
    }
    
    // Normalize receiver address (optional - can be null if not sending to someone specific)
    const normalizedReceiverAddress = receiverAddress ? receiverAddress.trim().toLowerCase() : null
    
    // Calculate file hash BEFORE encryption for integrity verification
    const fileHash = calculateHash(req.file.buffer)
    
    // Parse allowed roles if provided as JSON string
    let parsedAllowedRoles = []
    if (allowedRoles) {
      try {
        parsedAllowedRoles = typeof allowedRoles === 'string' ? JSON.parse(allowedRoles) : allowedRoles
      } catch (e) {
        parsedAllowedRoles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
      }
    }

    const { iv, encryptedData } = encryptBuffer(req.file.buffer)
    // Create unique fileId with timestamp to avoid conflicts
    const timestamp = Date.now()
    const fileId = `${timestamp}_${req.file.originalname}`

    if (IPFS_ENABLED && ipfs) {
      const { cid } = await ipfs.add(encryptedData)
      const { cid: ivCid } = await ipfs.add(iv)
      const dataLocation = cid.toString()
      await axios.post(`${METADATA_SERVICE_URL}/metadata`, {
        fileId,
        dataLocation,
        accessRights: accessRights || 'private',
        attention: attention || 'Always',
        confidence: confidence || 'Usually',
        label: label || '',
        ownerAddress: fileOwner.toLowerCase(),
        receiverAddress: normalizedReceiverAddress,
        isPublic: isPublic === 'true' || isPublic === true,
        accessType: accessType || (isPublic === 'true' || isPublic === true ? 'public' : 'private'),
        allowedRoles: parsedAllowedRoles,
        fileHash,
        imageHash: imageHash || null,
        originalFilename: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        documentType: documentType || '',
        description: description || ''
      })
      await storeOnChain(fileId, 'v1.0', dataLocation)

      return res.json({
        success: true,
        message: 'File stored on IPFS + chain + metadata DB',
        fileId,
        dataCid: dataLocation,
        ivCid: ivCid.toString()
      })
    } else {
      const encryptedPath = path.join(LOCAL_UPLOAD_DIR, fileId + '.enc')
      const ivPath = path.join(LOCAL_UPLOAD_DIR, fileId + '.iv')
      fs.writeFileSync(encryptedPath, encryptedData)
      fs.writeFileSync(ivPath, iv)
      const metadataResponse = await axios.post(`${METADATA_SERVICE_URL}/metadata`, {
        fileId,
        dataLocation: encryptedPath,
        accessRights: accessRights || 'private',
        attention: attention || 'Always',
        confidence: confidence || 'Usually',
        label: label || '',
        ownerAddress: fileOwner.toLowerCase(),
        receiverAddress: normalizedReceiverAddress,
        isPublic: isPublic === 'true' || isPublic === true,
        accessType: accessType || (isPublic === 'true' || isPublic === true ? 'public' : 'private'),
        allowedRoles: parsedAllowedRoles,
        fileHash,
        imageHash: imageHash || null,
        originalFilename: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        documentType: documentType || '',
        description: description || ''
      })
      await storeOnChain(fileId, 'v1.0', encryptedPath)

      return res.json({
        success: true,
        message: 'File encrypted & stored locally + chain + metadata DB',
        fileId,
        fileHash,
        encryptedFile: fileId + '.enc',
        ivFile: fileId + '.iv',
        metadata: metadataResponse.data
      })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// Get all files where user is sender OR receiver (from ledger)
app.get('/files/user/:address', async (req, res) => {
  try {
    const { address } = req.params
    const { data: files } = await axios.get(`${METADATA_SERVICE_URL}/metadata/user/${address}`)
    return res.status(200).json(files)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// Get all public files from ledger (no address needed)
app.get('/files/public/all', async (req, res) => {
  try {
    console.log('[Storage Service] Fetching all public files')
    const { data: files } = await axios.get(`${METADATA_SERVICE_URL}/metadata/public/all`)
    console.log(`[Storage Service] Retrieved ${files.length} public files`)
    return res.status(200).json(files)
  } catch (err) {
    console.error('[Storage Service] Error fetching public files:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Legacy endpoints - kept for compatibility
app.get('/files/owner/:address', async (req, res) => {
  try {
    const { address } = req.params
    const { data: files } = await axios.get(`${METADATA_SERVICE_URL}/metadata/owner/${address}`)
    return res.status(200).json(files)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/files/public/:address', async (req, res) => {
  try {
    const { address } = req.params
    const { data: files } = await axios.get(`${METADATA_SERVICE_URL}/metadata/public/${address}`)
    return res.status(200).json(files)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// Get files accessible by user (including role-based)
app.get('/files/accessible/:address', async (req, res) => {
  try {
    const { address } = req.params
    console.log(`[Storage Service] Fetching accessible files for: ${address}`)
    const { data: files } = await axios.get(`${METADATA_SERVICE_URL}/files/accessible/${address}`)
    console.log(`[Storage Service] Retrieved ${files.length} files`)
    return res.status(200).json(files)
  } catch (err) {
    console.error('[Storage Service] Error fetching accessible files:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Verify file hash - call metadata service correctly
app.post('/files/verify', async (req, res) => {
  try {
    const { fileId, fileHash } = req.body
    // The endpoint is at /files/verify on port 4000, not /metadata/files/verify
    const { data: result } = await axios.post('http://localhost:4000/files/verify', { fileId, fileHash })
    return res.status(200).json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/retrieve/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params
    const requesterAddress = req.query.address ? req.query.address.toLowerCase() : null
    
    // Security check: For non-public files, require an address
    const { data: metadata } = await axios.get(`${METADATA_SERVICE_URL}/metadata/${fileId}`)
    if (!metadata) {
      return res.status(404).json({ error: 'Metadata not found' })
    }
    
    // If file is not public and no address provided, deny access
    if (!metadata.isPublic && !requesterAddress) {
      console.log(`[Access Denied] No address provided for non-public file: ${fileId}`)
      return res.status(403).json({ 
        error: 'Authentication required. Please connect your wallet to access this file.' 
      })
    }

    const { dataLocation, attention, confidence, ownerAddress, receiverAddress, isPublic, accessType, allowedRoles, fileHash } = metadata
    
    // Check permissions: owner, receiver, public, or role-based access
    const normalizedOwnerAddress = ownerAddress?.toLowerCase()
    const normalizedReceiverAddress = receiverAddress?.toLowerCase()
    const isOwner = requesterAddress && requesterAddress === normalizedOwnerAddress
    const isReceiver = requesterAddress && normalizedReceiverAddress && requesterAddress === normalizedReceiverAddress
    
    let hasAccess = false
    let accessReason = ''
    
    if (isOwner) {
      hasAccess = true
      accessReason = 'owner'
    } else if (isReceiver) {
      hasAccess = true
      accessReason = 'receiver'
    } else if (isPublic) {
      hasAccess = true
      accessReason = 'public'
    } else if (accessType === 'role-based' && requesterAddress && allowedRoles && allowedRoles.length > 0) {
      // Check if user has the required role
      try {
        const { data: userRoles } = await axios.get(`${METADATA_SERVICE_URL}/user-roles/${requesterAddress}`)
        const userRoleNames = userRoles.map(ur => ur.roleName)
        const hasRequiredRole = allowedRoles.some(role => userRoleNames.includes(role))
        
        if (hasRequiredRole) {
          hasAccess = true
          accessReason = 'role-based'
          console.log(`[Access Granted] User ${requesterAddress} has role(s): ${userRoleNames.join(', ')}`)
        } else {
          hasAccess = false
          console.log(`[Access Denied] User ${requesterAddress} has roles: ${userRoleNames.join(', ')} but needs: ${allowedRoles.join(', ')}`)
        }
      } catch (err) {
        console.error('Error checking user roles:', err)
        hasAccess = false
      }
    } else if (accessType === 'role-based') {
      // Role-based file but user doesn't have address or no roles assigned
      hasAccess = false
      console.log(`[Access Denied] Role-based file requires one of: ${allowedRoles?.join(', ')}`)
    }
    
    if (!hasAccess) {
      // Log failed access attempt
      try {
        await axios.post(`${METADATA_SERVICE_URL}/access-log`, {
          fileId,
          accessedBy: requesterAddress || 'anonymous',
          accessType: 'download',
          fileHash: fileHash || '',
          ipAddress: req.ip || req.connection.remoteAddress || '',
          userAgent: req.headers['user-agent'] || '',
          success: false
        })
      } catch (logErr) {
        console.error('Failed to log access attempt:', logErr)
      }
      
      let errorMessage = 'Access denied. You do not have permission to access this file.'
      
      if (accessType === 'role-based' && allowedRoles && allowedRoles.length > 0) {
        errorMessage = `Access denied. This file requires one of the following roles: ${allowedRoles.join(', ')}. Please contact an administrator to be assigned the appropriate role.`
      } else if (accessType === 'private') {
        errorMessage = 'Access denied. This is a private file accessible only to the owner and receiver.'
      }
      
      return res.status(403).json({ 
        error: errorMessage,
        accessType,
        requiredRoles: allowedRoles || []
      })
    }
    
    console.log(`[Access Granted] User ${requesterAddress || 'anonymous'} accessing file ${fileId} - Reason: ${accessReason}`)

    if (levelPriority(attention) < levelPriority(confidence)) {
      return res.status(403).json({ error: 'Retrieval not allowed' })
    }

    if (IPFS_ENABLED && ipfs) {
      const encryptedDataChunks = []
      for await (const chunk of ipfs.cat(dataLocation)) {
        encryptedDataChunks.push(chunk)
      }
      return res.status(501).json({ error: 'IPFS retrieval with IV not fully implemented' })
    } else {
      const encPath = dataLocation
      const ivPath = encPath.replace('.enc', '.iv')
      if (!fs.existsSync(encPath) || !fs.existsSync(ivPath)) {
        return res.status(404).json({ error: 'Encrypted file or IV not found' })
      }
      const encryptedFile = fs.readFileSync(encPath)
      const iv = fs.readFileSync(ivPath)
      const decryptedData = decryptBuffer(encryptedFile, iv)
      
      // Set proper headers for file download with original filename
      const originalFilename = metadata.originalFilename || fileId
      const ext = path.extname(originalFilename) || ''
      const mimeTypes = {
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }
      const contentType = mimeTypes[ext.toLowerCase()] || 'application/octet-stream'
      
      // Log successful access
      try {
        await axios.post(`${METADATA_SERVICE_URL}/access-log`, {
          fileId,
          accessedBy: requesterAddress || 'anonymous',
          accessType: 'download',
          fileHash: fileHash || '',
          ipAddress: req.ip || req.connection.remoteAddress || '',
          userAgent: req.headers['user-agent'] || '',
          success: true
        })
      } catch (logErr) {
        console.error('Failed to log access:', logErr)
      }
      
      res.setHeader('Content-Type', contentType)
      res.setHeader('Content-Disposition', `attachment; filename="${originalFilename}"`)
      res.setHeader('Content-Length', decryptedData.length)
      return res.send(decryptedData)
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Storage service listening on http://localhost:${PORT}`)
})
