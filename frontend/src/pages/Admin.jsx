import React, { useState, useEffect } from 'react'
import { useGlobalContext } from '@/provider/Context'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function Admin() {
  const { account, isConnected } = useGlobalContext()
  const navigate = useNavigate()
  
  const [isAuthority, setIsAuthority] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Authority registration
  const [authorityName, setAuthorityName] = useState('')
  const [authorityType, setAuthorityType] = useState('')
  
  // Role creation
  const [roleName, setRoleName] = useState('')
  const [roleDescription, setRoleDescription] = useState('')
  const [roles, setRoles] = useState([])
  
  // User role assignment
  const [userAddress, setUserAddress] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isConnected) {
      navigate('/')
      return
    }
    checkAuthority()
    fetchRoles()
  }, [isConnected, account, navigate])

  const checkAuthority = async () => {
    if (!account) return
    
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:4000/authority/${account}`)
      if (response.ok) {
        setIsAuthority(true)
      } else {
        setIsAuthority(false)
      }
    } catch (err) {
      console.error('Error checking authority:', err)
      setIsAuthority(false)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await fetch('http://localhost:4000/roles')
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      }
    } catch (err) {
      console.error('Error fetching roles:', err)
    }
  }

  const handleRegisterAuthority = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      setMessage(null)
      
      const response = await fetch('http://localhost:4000/authority/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: account,
          name: authorityName,
          authorityType
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to register authority')
      }
      
      setMessage('Authority registered successfully!')
      setIsAuthority(true)
      setAuthorityName('')
      setAuthorityType('')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCreateRole = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      setMessage(null)
      
      const response = await fetch('http://localhost:4000/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleName,
          description: roleDescription,
          createdBy: account
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create role')
      }
      
      setMessage(`Role "${roleName}" created successfully!`)
      setRoleName('')
      setRoleDescription('')
      fetchRoles()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAssignRole = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      setMessage(null)
      
      const response = await fetch('http://localhost:4000/user-roles/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: userAddress,
          roleName: selectedRole,
          assignedBy: account
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to assign role')
      }
      
      setMessage(`Role "${selectedRole}" assigned to ${userAddress}!`)
      setUserAddress('')
      setSelectedRole('')
    } catch (err) {
      setError(err.message)
    }
  }

  if (!isConnected) {
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      {!isAuthority && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Register as Authority</h2>
          <p className="text-gray-600 mb-4">
            Register your wallet as an authority to create roles and manage access control.
          </p>
          
          <form onSubmit={handleRegisterAuthority} className="space-y-4">
            <div>
              <Label htmlFor="authorityName">Authority Name</Label>
              <Input
                id="authorityName"
                value={authorityName}
                onChange={(e) => setAuthorityName(e.target.value)}
                placeholder="e.g., Government of India"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="authorityType">Authority Type</Label>
              <Input
                id="authorityType"
                value={authorityType}
                onChange={(e) => setAuthorityType(e.target.value)}
                placeholder="e.g., Government, Department, Organization"
                required
              />
            </div>
            
            <Button type="submit">Register Authority</Button>
          </form>
        </div>
      )}

      {isAuthority && (
        <>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">✓ You are registered as an authority</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Create Role</h2>
            
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <Label htmlFor="roleName">Role Name</Label>
                <Input
                  id="roleName"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g., IncomeTaxDept, FinanceMinistry"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="roleDescription">Description</Label>
                <Input
                  id="roleDescription"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="e.g., Income Tax Department officials"
                />
              </div>
              
              <Button type="submit">Create Role</Button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Assign Role to User</h2>
            
            <form onSubmit={handleAssignRole} className="space-y-4">
              <div>
                <Label htmlFor="userAddress">User Wallet Address</Label>
                <Input
                  id="userAddress"
                  value={userAddress}
                  onChange={(e) => setUserAddress(e.target.value)}
                  placeholder="0x..."
                  className="font-mono"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="selectedRole">Select Role</Label>
                <select
                  id="selectedRole"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">-- Select a role --</option>
                  {roles.map((role) => (
                    <option key={role._id} value={role.roleName}>
                      {role.roleName} - {role.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <Button type="submit">Assign Role</Button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Existing Roles</h2>
            {roles.length === 0 ? (
              <p className="text-gray-600">No roles created yet.</p>
            ) : (
              <div className="space-y-2">
                {roles.map((role) => (
                  <div key={role._id} className="p-4 border rounded-lg">
                    <div className="font-semibold">{role.roleName}</div>
                    <div className="text-sm text-gray-600">{role.description || 'No description'}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Created: {new Date(role.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
          <p className="text-green-800">{message}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}

export default Admin

