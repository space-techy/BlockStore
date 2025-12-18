import mongoose from 'mongoose'

const RoleSchema = new mongoose.Schema({
  roleName: { type: String, required: true, unique: true, index: true },
  description: { type: String, default: '' },
  createdBy: { type: String, required: true }, // Authority address that created this role
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
})

export default mongoose.model('Role', RoleSchema)

