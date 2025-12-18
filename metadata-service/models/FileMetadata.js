import mongoose from 'mongoose'

const FileMetadataSchema = new mongoose.Schema({
  fileId: { type: String, required: true, unique: true },
  dataLocation: { type: String, required: true },
  ownerAddress: { type: String, required: true, index: true }, // Wallet address of the file owner (sender)
  receiverAddress: { type: String, default: null, index: true }, // Receiver address (if file is sent to someone)
  isPublic: { type: Boolean, default: false, index: true }, // Public files can be accessed by anyone
  
  // Role-based access control
  accessType: { type: String, default: 'public', enum: ['public', 'private', 'role-based'], index: true },
  allowedRoles: [{ type: String, index: true }], // Array of role names that can access this file
  
  // Hash storage for non-repudiation
  fileHash: { type: String, required: true, index: true }, // SHA-256 hash of the actual file content
  imageHash: { type: String, default: null }, // Separate hash for image preview/thumbnail if applicable
  blockchainTxHash: { type: String, default: null }, // Transaction hash from blockchain
  
  // Legacy fields
  accessRights: { type: String, default: 'private' },
  attention: { type: String, default: '' },
  confidence: { type: String, default: '' },
  label: { type: String, default: '' },
  
  // File metadata
  originalFilename: { type: String, required: true },
  fileSize: { type: Number, default: 0 }, // Size in bytes
  mimeType: { type: String, default: '' },
  
  // Document type for legal purposes
  documentType: { type: String, default: '', index: true }, // e.g., "Tender", "Contract", "Transaction"
  description: { type: String, default: '' },
  
  createdAt: { type: Date, default: Date.now, index: true }
})

export default mongoose.model('FileMetadata', FileMetadataSchema)