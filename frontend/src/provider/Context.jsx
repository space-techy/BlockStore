import React, { createContext, useContext, useState, useEffect } from 'react'

const Context = createContext()

function ContextProvider({ children }) {
  const [account, setAccount] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)

  // Check if MetaMask is installed
  const checkMetaMask = () => {
    if (typeof window.ethereum !== 'undefined') {
      return true
    }
    return false
  }

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!checkMetaMask()) {
      alert('MetaMask is not installed. Please install MetaMask to continue.')
      return false
    }

    try {
      setLoading(true)
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      if (accounts.length > 0) {
        const connectedAccount = accounts[0]
        setAccount(connectedAccount)
        setIsConnected(true)
        localStorage.setItem('connectedAccount', connectedAccount)
        return true
      }
      return false
    } catch (error) {
      console.error('Error connecting to MetaMask:', error)
      alert('Failed to connect to MetaMask. Please try again.')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null)
    setIsConnected(false)
    localStorage.removeItem('connectedAccount')
  }

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (checkMetaMask()) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            setAccount(accounts[0])
            setIsConnected(true)
          } else {
            // Check localStorage for previously connected account
            const savedAccount = localStorage.getItem('connectedAccount')
            if (savedAccount) {
              // Try to reconnect
              await connectWallet()
            }
          }
        } catch (error) {
          console.error('Error checking connection:', error)
        }
      }
    }

    checkConnection()

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
          localStorage.setItem('connectedAccount', accounts[0])
        } else {
          disconnectWallet()
        }
      })

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }
  }, [])

  const value = {
    account,
    isConnected,
    loading,
    connectWallet,
    disconnectWallet,
    checkMetaMask
  }
  
  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  )
}

export default ContextProvider

export const useGlobalContext = () => {
    const context = useContext(Context)
    if (!context) {
        throw new Error('useGlobalContext must be used within a Context.Provider')
    }
    return context
}
