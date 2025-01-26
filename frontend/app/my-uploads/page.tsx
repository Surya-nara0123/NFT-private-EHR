"use client"

import { useState, useEffect } from "react"
import { useUser } from "../context/UserContext"
import { useRouter } from "next/navigation"

interface Upload {
  type: "ipfs"
  hash: string
  name: string
  date: string
}

interface MintedNFT {
  tokenId: string
  ipfsHash: string
  date: string
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

  if (userRole !== "patient") return null

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">My Uploads and Minted NFTs</h1>

      <h2 className="text-2xl font-bold mt-6 mb-2">Uploaded IPFS Content</h2>
      {uploads.length === 0 ? (
        <p>No uploads yet.</p>
      ) : (
        <ul className="space-y-2">
          {uploads.map((upload, index) => (
            <li key={index} className="border p-2 rounded">
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
                <strong>IPFS Hash:</strong> {nft.ipfsHash}
              </p>
              <p>
                <strong>Minting Date:</strong> {new Date(nft.date).toLocaleString()}
              </p>
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

