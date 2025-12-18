import express from 'express'
import cors from 'cors'
import connectDB from './db.js'
import FileMetadata from './models/FileMetadata.js'
import FileLedger from './models/FileLedger.js'
import Role from './models/Role.js'
import Authority from './models/Authority.js'
import UserRole from './models/UserRole.js'
import AccessLog from './models/AccessLog.js'

const app = express()
app.use(cors())
app.use(express.json())

connectDB()

app.post('/metadata', async (req, res) => {
  try {
    const { 
      fileId, accessRights, dataLocation, attention, confidence, label, 
      ownerAddress, receiverAddress, isPublic, originalFilename,
      accessType, allowedRoles, fileHash, imageHash, blockchainTxHash,
      fileSize, mimeType, documentType, description
    } = req.body
    
    const normalizedOwnerAddress = ownerAddress ? ownerAddress.toLowerCase() : ''
    const normalizedReceiverAddress = receiverAddress ? receiverAddress.toLowerCase() : null
    const isPublicFlag = isPublic === true || isPublic === 'true'
    
    // Determine access type
    let finalAccessType = accessType || (isPublicFlag ? 'public' : 'private')
    if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
      finalAccessType = 'role-based'
    }
    
    // Update or create FileMetadata
    const updated = await FileMetadata.findOneAndUpdate(
      { fileId },
      { 
        accessRights, 
        dataLocation, 
        attention, 
        confidence,
        label: label || '',
        ownerAddress: normalizedOwnerAddress,
        receiverAddress: normalizedReceiverAddress,
        isPublic: isPublicFlag,
        accessType: finalAccessType,
        allowedRoles: allowedRoles || [],
        fileHash: fileHash || '',
        imageHash: imageHash || null,
        blockchainTxHash: blockchainTxHash || null,
        originalFilename: originalFilename || fileId,
        fileSize: fileSize || 0,
        mimeType: mimeType || '',
        documentType: documentType || '',
        description: description || ''
      },
      { upsert: true, new: true }
    )

    // Update or create ledger entry
    await FileLedger.findOneAndUpdate(
      { fileId },
      {
        fileId,
        ownerAddress: normalizedOwnerAddress,
        receiverAddress: normalizedReceiverAddress,
        isPublic: isPublicFlag,
        accessType: finalAccessType,
        allowedRoles: allowedRoles || [],
        fileHash: fileHash || '',
        imageHash: imageHash || null,
        blockchainTxHash: blockchainTxHash || null,
        originalFilename: originalFilename || fileId,
        fileSize: fileSize || 0,
        mimeType: mimeType || '',
        label: label || '',
        documentType: documentType || '',
        description: description || '',
        dataLocation: dataLocation,
        uploadedAt: new Date()
      },
      { upsert: true, new: true }
    )

    return res.status(200).json(updated)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})


app.get('/metadata/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params
    const metadata = await FileMetadata.findOne({ fileId })
    if (!metadata) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(metadata)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})


app.delete('/metadata/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params
    const deleted = await FileMetadata.findOneAndDelete({ fileId })
    if (!deleted) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(deleted)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// Get all files where user is sender OR receiver (from ledger)
app.get('/metadata/user/:address', async (req, res) => {
  try {
    const { address } = req.params
    const normalizedAddress = address.toLowerCase()
    
    // Get files from ledger where user is sender OR receiver
    const ledgerFiles = await FileLedger.find({
      $or: [
        { ownerAddress: normalizedAddress },
        { receiverAddress: normalizedAddress }
      ]
    }).sort({ uploadedAt: -1 })
    
    return res.status(200).json(ledgerFiles)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// Get all files by owner address (user's own files - legacy endpoint, kept for compatibility)
app.get('/metadata/owner/:address', async (req, res) => {
  try {
    const { address } = req.params
    const files = await FileMetadata.find({ ownerAddress: address.toLowerCase() }).sort({ createdAt: -1 })
    return res.status(200).json(files)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// Get ALL public files from ledger (no address required)
app.get('/metadata/public/all', async (req, res) => {
  try {
    const files = await FileLedger.find({ 
      isPublic: true 
    }).sort({ uploadedAt: -1 })
    return res.status(200).json(files)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// Get public files by address (anyone can access - legacy endpoint, kept for compatibility)
app.get('/metadata/public/:address', async (req, res) => {
  try {
    const { address } = req.params
    const files = await FileMetadata.find({ 
      ownerAddress: address.toLowerCase(),
      isPublic: true 
    }).sort({ createdAt: -1 })
    return res.status(200).json(files)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ==================== AUTHORITY MANAGEMENT ====================

// Register a new authority
app.post('/authority/register', async (req, res) => {
  try {
    const { walletAddress, name, authorityType } = req.body
    if (!walletAddress || !name || !authorityType) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    const authority = await Authority.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { 
        walletAddress: walletAddress.toLowerCase(),
        name,
        authorityType,
        isActive: true,
        canCreateRoles: true
      },
      { upsert: true, new: true }
    )
    
    return res.status(200).json(authority)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// Get authority by address
app.get('/authority/:address', async (req, res) => {
  try {
    const authority = await Authority.findOne({ walletAddress: req.params.address.toLowerCase() })
    if (!authority) return res.status(404).json({ error: 'Authority not found' })
    return res.status(200).json(authority)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// List all authorities
app.get('/authorities', async (req, res) => {
  try {
    const authorities = await Authority.find({ isActive: true }).sort({ createdAt: -1 })
    return res.status(200).json(authorities)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ==================== ROLE MANAGEMENT ====================

// Create a new role (authority only)
app.post('/roles', async (req, res) => {
  try {
    const { roleName, description, createdBy } = req.body
    if (!roleName || !createdBy) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    // Check if creator is an authority
    const authority = await Authority.findOne({ 
      walletAddress: createdBy.toLowerCase(),
      isActive: true,
      canCreateRoles: true
    })
    
    if (!authority) {
      return res.status(403).json({ error: 'Not authorized to create roles' })
    }
    
    const role = await Role.findOneAndUpdate(
      { roleName },
      {
        roleName,
        description: description || '',
        createdBy: createdBy.toLowerCase(),
        isActive: true
      },
      { upsert: true, new: true }
    )
    
    return res.status(200).json(role)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// Get all active roles
app.get('/roles', async (req, res) => {
  try {
    const roles = await Role.find({ isActive: true }).sort({ roleName: 1 })
    return res.status(200).json(roles)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// Deactivate a role
app.delete('/roles/:roleName', async (req, res) => {
  try {
    const role = await Role.findOneAndUpdate(
      { roleName: req.params.roleName },
      { isActive: false },
      { new: true }
    )
    if (!role) return res.status(404).json({ error: 'Role not found' })
    return res.status(200).json(role)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ==================== USER ROLE ASSIGNMENT ====================

// Assign role to user
app.post('/user-roles/assign', async (req, res) => {
  try {
    const { walletAddress, roleName, assignedBy } = req.body
    if (!walletAddress || !roleName || !assignedBy) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    // Check if assigner is an authority
    const authority = await Authority.findOne({ 
      walletAddress: assignedBy.toLowerCase(),
      isActive: true
    })
    
    if (!authority) {
      return res.status(403).json({ error: 'Not authorized to assign roles' })
    }
    
    // Check if role exists
    const role = await Role.findOne({ roleName, isActive: true })
    if (!role) {
      return res.status(404).json({ error: 'Role not found' })
    }
    
    const userRole = await UserRole.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase(), roleName },
      {
        walletAddress: walletAddress.toLowerCase(),
        roleName,
        assignedBy: assignedBy.toLowerCase(),
        isActive: true
      },
      { upsert: true, new: true }
    )
    
    return res.status(200).json(userRole)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// Remove role from user
app.post('/user-roles/revoke', async (req, res) => {
  try {
    const { walletAddress, roleName } = req.body
    if (!walletAddress || !roleName) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    const userRole = await UserRole.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase(), roleName },
      { isActive: false },
      { new: true }
    )
    
    if (!userRole) return res.status(404).json({ error: 'User role not found' })
    return res.status(200).json(userRole)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// Get all roles for a user
app.get('/user-roles/:address', async (req, res) => {
  try {
    const userRoles = await UserRole.find({ 
      walletAddress: req.params.address.toLowerCase(),
      isActive: true
    })
    return res.status(200).json(userRoles)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// Get all users with a specific role
app.get('/roles/:roleName/users', async (req, res) => {
  try {
    const users = await UserRole.find({ 
      roleName: req.params.roleName,
      isActive: true
    })
    return res.status(200).json(users)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ==================== ACCESS LOGGING (Non-Repudiation) ====================

// Log file access
app.post('/access-log', async (req, res) => {
  try {
    const { fileId, accessedBy, accessType, fileHash, ipAddress, userAgent } = req.body
    
    const log = new AccessLog({
      fileId,
      accessedBy: accessedBy ? accessedBy.toLowerCase() : '',
      accessType: accessType || 'view',
      fileHash: fileHash || '',
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
      success: true
    })
    
    await log.save()
    return res.status(200).json(log)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// Get access logs for a file
app.get('/access-log/file/:fileId', async (req, res) => {
  try {
    const logs = await AccessLog.find({ fileId: req.params.fileId }).sort({ accessTime: -1 })
    return res.status(200).json(logs)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// Get access logs by user
app.get('/access-log/user/:address', async (req, res) => {
  try {
    const logs = await AccessLog.find({ 
      accessedBy: req.params.address.toLowerCase() 
    }).sort({ accessTime: -1 })
    return res.status(200).json(logs)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ==================== ROLE-BASED FILE QUERIES ====================

// Get files accessible by a specific role
app.get('/files/role/:roleName', async (req, res) => {
  try {
    const files = await FileLedger.find({ 
      allowedRoles: req.params.roleName 
    }).sort({ uploadedAt: -1 })
    return res.status(200).json(files)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// Get files accessible by a user (considering their roles)
app.get('/files/accessible/:address', async (req, res) => {
  try {
    const address = req.params.address.toLowerCase()
    console.log(`[Accessible Files] Request for address: ${address}`)
    
    // Get user's roles
    const userRoles = await UserRole.find({ walletAddress: address, isActive: true })
    const roleNames = userRoles.map(ur => ur.roleName)
    console.log(`[Accessible Files] User roles:`, roleNames)
    
    // Query for files the user can access
    const query = {
      $or: [
        { isPublic: true }, // Public files
        { ownerAddress: address }, // Files they own
        { receiverAddress: address }, // Files sent to them
        { allowedRoles: { $in: roleNames } } // Files accessible via their roles
      ]
    }
    
    const files = await FileLedger.find(query).sort({ uploadedAt: -1 })
    console.log(`[Accessible Files] Found ${files.length} files for ${address}`)
    
    // Also log total files in ledger for debugging
    const totalFiles = await FileLedger.countDocuments()
    console.log(`[Accessible Files] Total files in ledger: ${totalFiles}`)
    
    return res.status(200).json(files)
  } catch (err) {
    console.error('[Accessible Files] Error:', err)
    return res.status(500).json({ error: err.message })
  }
})

// Verify file hash
app.post('/files/verify', async (req, res) => {
  try {
    const { fileId, fileHash } = req.body
    if (!fileId || !fileHash) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    const metadata = await FileMetadata.findOne({ fileId })
    if (!metadata) {
      return res.status(404).json({ error: 'File not found' })
    }
    
    const isValid = metadata.fileHash === fileHash
    return res.status(200).json({
      fileId,
      isValid,
      storedHash: metadata.fileHash,
      providedHash: fileHash,
      message: isValid ? 'File hash verified successfully' : 'File hash mismatch - file may have been tampered with'
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

app.listen(4000, () => {
  console.log(`Metadata server running on http://localhost:4000`)
})