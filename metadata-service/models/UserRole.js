import mongoose from 'mongoose'

const UserRoleSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, index: true },
  roleName: { type: String, required: true, index: true },
  assignedBy: { type: String, required: true }, // Authority address that assigned this role
  assignedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
})

// Compound index for efficient lookups
UserRoleSchema.index({ walletAddress: 1, roleName: 1 }, { unique: true })

export default mongoose.model('UserRole', UserRoleSchema)

