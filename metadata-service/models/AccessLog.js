import mongoose from 'mongoose'

const AccessLogSchema = new mongoose.Schema({
  fileId: { type: String, required: true, index: true },
  accessedBy: { type: String, required: true, index: true }, // Wallet address
  accessType: { type: String, required: true, enum: ['view', 'download', 'verify'] },
  accessTime: { type: Date, default: Date.now, index: true },
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  fileHash: { type: String, required: true }, // Hash at time of access for non-repudiation
  success: { type: Boolean, default: true }
})

export default mongoose.model('AccessLog', AccessLogSchema)

