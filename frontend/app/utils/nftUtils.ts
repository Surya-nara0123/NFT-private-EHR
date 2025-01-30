import axios from "axios"

const API_BASE_URL = "http://localhost:8000/api" // Update this to match your backend URL

export async function mintNFT(ipfsHash: string): Promise<string> {
  try {
    const response = await axios.post(`${API_BASE_URL}/createEHR`, { id: ipfsHash })
    return response.data.message
  } catch (error) {
    console.error("Error minting NFT:", error)
    throw error
  }
}

export async function getNFTs() {
  try {
    const response = await axios.get(`${API_BASE_URL}/readEHR`)
    return response.data
  } catch (error) {
    console.error("Error fetching NFTs:", error)
    throw error
  }
}

export async function buyNFT(tokenId: string): Promise<void> {
  try {
    await axios.post(`${API_BASE_URL}/transferFraction`, {
      id: tokenId,
      fractionType: "ownership", // Assuming 'ownership' is the fraction type for buying
      newOwner: "current_user_id", // Replace with actual user ID
    })
  } catch (error) {
    console.error("Error buying NFT:", error)
    throw error
  }
}

export async function addFraction(id: string, fractionType: string, dataIpfs: string, accessLevel: string) {
  try {
    const response = await axios.post(`${API_BASE_URL}/addFraction`, {
      id,
      fractionType,
      DataIpfs: dataIpfs,
      accessLevel,
    })
    return response.data.message
  } catch (error) {
    console.error("Error adding fraction:", error)
    throw error
  }
}

export async function changeAccess(id: string, fractionType: string, newLevel: string) {
  try {
    const response = await axios.post(`${API_BASE_URL}/changeNFTFractionAccess`, {
      id,
      fractionType,
      newLevel,
    })
    return response.data.message
  } catch (error) {
    console.error("Error adding fraction:", error)
    throw error
  }
}

