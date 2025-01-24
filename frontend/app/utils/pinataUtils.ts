import axios from "axios"

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY

export async function uploadToPinata(file: File): Promise<string> {
  console.log(PINATA_API_KEY, PINATA_SECRET_API_KEY)
  const formData = new FormData()
  formData.append("file", file)

  const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
  })

  return response.data.IpfsHash
}

