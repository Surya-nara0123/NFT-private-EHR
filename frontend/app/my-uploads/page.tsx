"use client"

import { useState, useEffect } from "react"
import { useUser } from "../context/UserContext"
import { useRouter } from "next/navigation"
import { mintNFT, addFraction } from "../utils/nftUtils"

interface Upload {
  type: "ipfs"
  category: string
  hash: string
  name: string
  date: string
}

interface MintedNFT {
  tokenId: string
  ipfsHash: string
  category: string
  date: string
  price?: string
  listedInMarketplace?: boolean
}

interface DoctorUpload {
  name: string
  content: any
  date: string
  uploadedBy: "doctor"
}

export default function MyUploadsPage() {
  const [uploads, setUploads] = useState<Upload[]>([])
  const [mintedNFTs, setMintedNFTs] = useState<MintedNFT[]>([])
  const [doctorUploads, setDoctorUploads] = useState<DoctorUpload[]>([])
  const [minting, setMinting] = useState<Record<string, boolean>>({})
  const [listing, setListing] = useState<Record<string, boolean>>({})
  const { userRole } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (userRole !== "patient") {
      router.push("/dashboard")
    } else {
      const storedUploads = JSON.parse(localStorage.getItem("uploads") || "[]")
      const storedMintedNFTs = JSON.parse(localStorage.getItem("mintedNFTs") || "[]")
      const storedDoctorUploads = JSON.parse(localStorage.getItem("doctorUploads") || "{}")

      setUploads(storedUploads)
      setMintedNFTs(storedMintedNFTs)

      // Assuming the patient ID is stored in localStorage. In a real app, this would come from authentication.
      const patientId = localStorage.getItem("patientId") || "defaultPatientId"
      setDoctorUploads(storedDoctorUploads[patientId] || [])
    }
  }, [userRole, router])

  const handleUploadToIPFS = async (doctorUpload: DoctorUpload) => {
    // Here you would implement the logic to upload the doctor's file to IPFS
    // For now, we'll just remove it from the doctor uploads and add it to the patient's uploads
    const updatedDoctorUploads = doctorUploads.filter((u) => u.name !== doctorUpload.name)
    setDoctorUploads(updatedDoctorUploads)

    const newUpload: Upload = {
      type: "ipfs",
      category: "Doctor Upload",
      hash: "mock-ipfs-hash", // In a real implementation, this would be the actual IPFS hash
      name: doctorUpload.name,
      date: new Date().toISOString(),
    }

    const updatedUploads = [...uploads, newUpload]
    setUploads(updatedUploads)

    // Update local storage
    const patientId = localStorage.getItem("patientId") || "defaultPatientId"
    const storedDoctorUploads = JSON.parse(localStorage.getItem("doctorUploads") || "{}")
    storedDoctorUploads[patientId] = updatedDoctorUploads
    localStorage.setItem("doctorUploads", JSON.stringify(storedDoctorUploads))
    localStorage.setItem("uploads", JSON.stringify(updatedUploads))
  }

  const handleMintNFT = async (upload: Upload) => {
    setMinting((prev) => ({ ...prev, [upload.hash]: true }))
    try {
      let id = prompt("Enter the token Id of the NFT");
      let tokenId = id!;
      try{
        await mintNFT(id!);
      } catch (e) {}

      const res = await addFraction(id!, upload.category, upload.hash, "RESTRICTED");

      const newNFT: MintedNFT = {
        tokenId,
        ipfsHash: upload.hash,
        category: upload.category,
        date: new Date().toISOString(),
      }
      setMintedNFTs((prev) => [...prev, newNFT])

      // Update local storage
      const storedMintedNFTs = JSON.parse(localStorage.getItem("mintedNFTs") || "[]")
      storedMintedNFTs.push(newNFT)
      localStorage.setItem("mintedNFTs", JSON.stringify(storedMintedNFTs))

      alert(`NFT minted successfully! Token ID: ${tokenId}`)
    } catch (error) {
      console.error("Error minting NFT:", error)
      alert("Error minting NFT")
    }
    setMinting((prev) => ({ ...prev, [upload.hash]: false }))
  }

  const handleAddToMarketplace = async (nft: MintedNFT) => {
    setListing((prev) => ({ ...prev, [nft.tokenId]: true }))
    try {
      const price = prompt("Enter the price for this NFT (in ETH):")
      if (price === null) {
        throw new Error("Price input cancelled")
      }

      // Here you would typically make an API call to your backend to list the NFT in the marketplace
      // For this example, we'll just update our local state and storage
      const updatedNFT: MintedNFT = { ...nft, price, listedInMarketplace: true }
      setMintedNFTs((prev) => prev.map((item) => (item.tokenId === nft.tokenId ? updatedNFT : item)))

      // Update local storage
      const storedMintedNFTs = JSON.parse(localStorage.getItem("mintedNFTs") || "[]")
      const updatedStoredNFTs = storedMintedNFTs.map((item: MintedNFT) =>
        item.tokenId === nft.tokenId ? updatedNFT : item,
      )
      localStorage.setItem("mintedNFTs", JSON.stringify(updatedStoredNFTs))

      // Update marketplace listings in local storage
      const marketplaceListings = JSON.parse(localStorage.getItem("marketplaceListings") || "[]")
      marketplaceListings.push(updatedNFT)
      localStorage.setItem("marketplaceListings", JSON.stringify(marketplaceListings))

      alert(`NFT successfully listed in the marketplace for ${price} ETH`)
    } catch (error) {
      console.error("Error listing NFT in marketplace:", error)
      alert("Error listing NFT in marketplace")
    }
    setListing((prev) => ({ ...prev, [nft.tokenId]: false }))
  }

  if (userRole !== "patient") return null

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">My Uploads and Minted NFTs</h1>

      <h2 className="text-2xl font-bold mt-6 mb-2">Uploaded IPFS Content</h2>
      {uploads.length === 0 ? (
        <p>No uploads yet.</p>
      ) : (
        <ul className="space-y-4">
          {uploads.map((upload, index) => (
            <li key={index} className="border p-4 rounded">
              <p>
                <strong>Category:</strong> {upload.category}
              </p>
              <p>
                <strong>File Name:</strong> {upload.name}
              </p>
              <p>
                <strong>IPFS Hash:</strong> {upload.hash}
              </p>
              <p>
                <strong>Upload Date:</strong> {new Date(upload.date).toLocaleString()}
              </p>
              <a
                href={`https://gateway.pinata.cloud/ipfs/${upload.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View on IPFS
              </a>
              <button
                onClick={() => handleMintNFT(upload)}
                disabled={minting[upload.hash]}
                className="ml-4 bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
              >
                {minting[upload.hash] ? "Minting..." : "Mint NFT"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-2xl font-bold mt-6 mb-2">Minted NFTs</h2>
      {mintedNFTs.length === 0 ? (
        <p>No minted NFTs yet.</p>
      ) : (
        <ul className="space-y-2">
          {mintedNFTs.map((nft, index) => (
            <li key={index} className="border p-2 rounded">
              <p>
                <strong>Token ID:</strong> {nft.tokenId}
              </p>
              <p>
                <strong>Category:</strong> {nft.category}
              </p>
              <p>
                <strong>IPFS Hash:</strong> {nft.ipfsHash}
              </p>
              <p>
                <strong>Minting Date:</strong> {new Date(nft.date).toLocaleString()}
              </p>
              {nft.listedInMarketplace ? (
                <p>
                  <strong>Listed in Marketplace for:</strong> {nft.price} ETH
                </p>
              ) : (
                <button
                  onClick={() => handleAddToMarketplace(nft)}
                  disabled={listing[nft.tokenId]}
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                >
                  {listing[nft.tokenId] ? "Listing..." : "Add to Marketplace"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-2xl font-bold mt-6 mb-2">Doctor Uploaded Files (Not Yet on IPFS)</h2>
      {doctorUploads.length === 0 ? (
        <p>No doctor uploads yet.</p>
      ) : (
        <ul className="space-y-2">
          {doctorUploads.map((upload, index) => (
            <li key={index} className="border p-2 rounded">
              <p>
                <strong>File Name:</strong> {upload.name}
              </p>
              <p>
                <strong>Upload Date:</strong> {new Date(upload.date).toLocaleString()}
              </p>
              <button
                onClick={() => handleUploadToIPFS(upload)}
                className="bg-blue-500 text-white px-2 py-1 rounded mt-2"
              >
                Upload to IPFS
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

