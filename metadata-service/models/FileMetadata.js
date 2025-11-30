import mongoose from 'mongoose'

const FileMetadataSchema = new mongoose.Schema({
  fileId: { type: String, required: true, unique: true },
  dataLocation: { type: String, required: true },
  ownerAddress: { type: String, required: true, index: true }, // Wallet address of the file owner
  isPublic: { type: Boolean, default: false, index: true }, // Public files can be accessed by anyone with the address
  accessRights: { type: String, default: 'private' },
  attention: { type: String, default: '' },
  confidence: { type: String, default: '' },
  label: { type: String, default: '' },
  originalFilename: { type: String, required: true }, // Store original filename for downloads
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('FileMetadata', FileMetadataSchema)