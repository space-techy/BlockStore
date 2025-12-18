import mongoose from 'mongoose'

const FileLedgerSchema = new mongoose.Schema({
  fileId: { type: String, required: true, unique: true, index: true },
  ownerAddress: { type: String, required: true, index: true }, // Sender/Uploader address
  receiverAddress: { type: String, default: null, index: true }, // Receiver address (if file is sent to someone)
  
  // Access control
  isPublic: { type: Boolean, default: false, index: true },
  accessType: { type: String, default: 'public', enum: ['public', 'private', 'role-based'], index: true },
  allowedRoles: [{ type: String, index: true }], // Roles that can access
  
  // Hashes for integrity and non-repudiation
  fileHash: { type: String, required: true, index: true },
  imageHash: { type: String, default: null },
  blockchainTxHash: { type: String, default: null },
  
  // File info
  originalFilename: { type: String, required: true },
  fileSize: { type: Number, default: 0 },
  mimeType: { type: String, default: '' },
  label: { type: String, default: '' },
  documentType: { type: String, default: '', index: true },
  description: { type: String, default: '' },
  dataLocation: { type: String, required: true },
  
  uploadedAt: { type: Date, default: Date.now, index: true }
})

export default mongoose.model('FileLedger', FileLedgerSchema)

