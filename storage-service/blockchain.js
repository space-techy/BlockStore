import { JsonRpcProvider, Wallet, Contract } from 'ethers'
import contractArtifact from './artifacts/FileRegistry.json' with { type: 'json' }

const GANACHE_URL = 'http://127.0.0.1:8545'
const PRIVATE_KEY = '0x2d29d0f0c009bb139c07d48aac0d7ba2d3daecad5e0fbe86ecc98462f32c2ebd'

const provider = new JsonRpcProvider(GANACHE_URL)
const wallet = new Wallet(PRIVATE_KEY, provider)
const contractAddress = '0xDCf43a06CcB54580147613d8A6073d79c4bb77a0'

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
