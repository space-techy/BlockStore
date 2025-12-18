import mongoose from 'mongoose'

const AuthoritySchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  authorityType: { type: String, required: true }, // e.g., "Government", "Department", "Organization"
  isActive: { type: Boolean, default: true },
  canCreateRoles: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Authority', AuthoritySchema)

