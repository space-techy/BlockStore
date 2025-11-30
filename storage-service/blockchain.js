import { JsonRpcProvider, Wallet, Contract } from 'ethers'
import contractArtifact from './artifacts/FileRegistry.json' with { type: 'json' }

const GANACHE_URL = 'http://127.0.0.1:8545'
const PRIVATE_KEY = '0x5c7a050c7b0e3a6896e9667a6dff3a6b389c665aaed218c352071890c05520ee'

const provider = new JsonRpcProvider(GANACHE_URL)
const wallet = new Wallet(PRIVATE_KEY, provider)
const contractAddress = '0xA5c713F475BE55D4dC333d4683D3A2eA7504B725'

export const fileRegistry = new Contract(
  contractAddress,
  contractArtifact.abi,
  wallet
)

export async function storeOnChain(fileId, version, fileHash) {
  const tx = await fileRegistry.storeFile(fileId, version, fileHash)
  await tx.wait()
  console.log(`File stored on-chain! Tx Hash: ${tx.hash}`)
}

export async function getFileOnChain(fileId) {
  const data = await fileRegistry.getFile(fileId)
  return {
    version: data[0],
    timestamp: Number(data[1]),
    fileHash: data[2],
    owner: data[3]
  }
}
