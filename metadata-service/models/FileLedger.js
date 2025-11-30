import mongoose from 'mongoose'

const FileLedgerSchema = new mongoose.Schema({
  fileId: { type: String, required: true, unique: true, index: true },
  ownerAddress: { type: String, required: true, index: true }, // Sender/Uploader address
  receiverAddress: { type: String, default: null, index: true }, // Receiver address (if file is sent to someone)
  isPublic: { type: Boolean, default: false, index: true }, // Public files can be accessed by anyone
  originalFilename: { type: String, required: true },
  label: { type: String, default: '' },
  dataLocation: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now, index: true }
})

export default mongoose.model('FileLedger', FileLedgerSchema)

