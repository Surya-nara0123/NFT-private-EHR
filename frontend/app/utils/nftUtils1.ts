import axios from "axios"

const API_BASE_URL = "http://localhost:8001/api" // Update this to match your backend URL

export async function getNFTs() {
    try {
      const response = await axios.get(`${API_BASE_URL}/readEHR`)
      return response.data
    } catch (error) {
      console.error("Error fetching NFTs:", error)
      throw error
    }
  }

export async function getNFTFraction() {
    try {
      const response = await axios.get(`${API_BASE_URL}/readFraction`)
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

