import express from 'express'
import cors from 'cors'
import connectDB from './db.js'
import FileMetadata from './models/FileMetadata.js'
import FileLedger from './models/FileLedger.js'

const app = express()
app.use(cors())
app.use(express.json())

connectDB()

app.post('/metadata', async (req, res) => {
  try {
    const { fileId, accessRights, dataLocation, attention, confidence, label, ownerAddress, receiverAddress, isPublic, originalFilename } = req.body
    
    const normalizedOwnerAddress = ownerAddress ? ownerAddress.toLowerCase() : ''
    const normalizedReceiverAddress = receiverAddress ? receiverAddress.toLowerCase() : null
    const isPublicFlag = isPublic === true || isPublic === 'true'
    
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
        originalFilename: originalFilename || fileId
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
        originalFilename: originalFilename || fileId,
        label: label || '',
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

app.listen(4000, () => {
  console.log(`Metadata server running on http://localhost:4000`)
})