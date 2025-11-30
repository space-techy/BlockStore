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
const METADATA_SERVICE_URL = process.env.METADATA_SERVICE_URL || 'http://localhost:4000/metadata'
const LOCAL_UPLOAD_DIR = path.join(__dirname, 'uploads')
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR)
}

let ipfs
if (IPFS_ENABLED) {
  ipfs = create({ host: 'localhost', port: '5001', protocol: 'http' })
}

const ENCRYPTION_KEY = Buffer.from('12345678901234567890123456789012')
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
    const { attention, confidence, label, accessRights, ownerAddress, senderAddress, receiverAddress, isPublic } = req.body
    
    // Use senderAddress as ownerAddress if provided, otherwise use ownerAddress
    const fileOwner = senderAddress || ownerAddress
    if (!fileOwner) {
      return res.status(400).json({ error: 'ownerAddress or senderAddress is required' })
    }
    
    // Normalize receiver address (optional - can be null if not sending to someone specific)
    const normalizedReceiverAddress = receiverAddress ? receiverAddress.trim().toLowerCase() : null

    const { iv, encryptedData } = encryptBuffer(req.file.buffer)
    // Create unique fileId with timestamp to avoid conflicts
    const timestamp = Date.now()
    const fileId = `${timestamp}_${req.file.originalname}`

    if (IPFS_ENABLED && ipfs) {
      const { cid } = await ipfs.add(encryptedData)
      const { cid: ivCid } = await ipfs.add(iv)
      const dataLocation = cid.toString()
      await axios.post(METADATA_SERVICE_URL, {
        fileId,
        dataLocation,
        accessRights: accessRights || 'private',
        attention: attention || 'Always',
        confidence: confidence || 'Usually',
        label: label || '',
        ownerAddress: fileOwner.toLowerCase(),
        receiverAddress: normalizedReceiverAddress,
        isPublic: isPublic === 'true' || isPublic === true,
        originalFilename: req.file.originalname
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
      await axios.post(METADATA_SERVICE_URL, {
        fileId,
        dataLocation: encryptedPath,
        accessRights: accessRights || 'private',
        attention: attention || 'Always',
        confidence: confidence || 'Usually',
        label: label || '',
        ownerAddress: fileOwner.toLowerCase(),
        receiverAddress: normalizedReceiverAddress,
        isPublic: isPublic === 'true' || isPublic === true,
        originalFilename: req.file.originalname
      })
      await storeOnChain(fileId, 'v1.0', encryptedPath)

      return res.json({
        success: true,
        message: 'File encrypted & stored locally + chain + metadata DB',
        fileId,
        encryptedFile: fileId + '.enc',
        ivFile: fileId + '.iv'
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
    const { data: files } = await axios.get(`${METADATA_SERVICE_URL}/user/${address}`)
    return res.status(200).json(files)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// Get all public files from ledger (no address needed)
app.get('/files/public/all', async (req, res) => {
  try {
    const { data: files } = await axios.get(`${METADATA_SERVICE_URL}/public/all`)
    return res.status(200).json(files)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// Legacy endpoints - kept for compatibility
app.get('/files/owner/:address', async (req, res) => {
  try {
    const { address } = req.params
    const { data: files } = await axios.get(`${METADATA_SERVICE_URL}/owner/${address}`)
    return res.status(200).json(files)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/files/public/:address', async (req, res) => {
  try {
    const { address } = req.params
    const { data: files } = await axios.get(`${METADATA_SERVICE_URL}/public/${address}`)
    return res.status(200).json(files)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/retrieve/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params
    const requesterAddress = req.query.address ? req.query.address.toLowerCase() : null
    const { data: metadata } = await axios.get(`${METADATA_SERVICE_URL}/${fileId}`)
    if (!metadata) {
      return res.status(404).json({ error: 'Metadata not found' })
    }

    const { dataLocation, attention, confidence, ownerAddress, receiverAddress, isPublic } = metadata
    
    // Check permissions: owner can always access, receiver can access, public files can be accessed by anyone
    const normalizedOwnerAddress = ownerAddress?.toLowerCase()
    const normalizedReceiverAddress = receiverAddress?.toLowerCase()
    const isOwner = requesterAddress && requesterAddress === normalizedOwnerAddress
    const isReceiver = requesterAddress && normalizedReceiverAddress && requesterAddress === normalizedReceiverAddress
    
    if (!isPublic && !isOwner && !isReceiver) {
      return res.status(403).json({ error: 'Access denied. File is private.' })
    }

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
