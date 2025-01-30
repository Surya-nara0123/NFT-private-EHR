import { uploadToPinata } from "./pinataUtils"
import { addFraction } from "./nftUtils"

export async function uploadCategorizedDataToIPFS(data: Record<string, any>) {
  const ipfsHashes: Record<string, string> = {}

  for (const [category, content] of Object.entries(data)) {
    const jsonContent = JSON.stringify(content)
    const blob = new Blob([jsonContent], { type: "application/json" })
    const file = new File([blob], `${category}.json`, { type: "application/json" })

    try {
      const hash = await uploadToPinata(file)
      ipfsHashes[category] = hash

      // Add fraction to the blockchain
    //   await addFraction(hash, category, hash, "public") // Assuming 'public' access level for now
    } catch (error) {
      console.error(`Error uploading ${category} to IPFS:`, error)
    }
  }

  return ipfsHashes
}

