"use client"

import { useState, useEffect } from "react"
import { useUser } from "../context/UserContext"
import { useRouter } from "next/navigation"

export default function DoctorUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [patientId, setPatientId] = useState("")
  const [uploading, setUploading] = useState(false)
  const { userRole } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (userRole !== "doctor") {
      router.push("/dashboard")
    }
  }, [userRole, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0].type === "application/json") {
      setFile(e.target.files[0])
    } else {
      alert("Please upload a JSON file")
    }
  }

  const handleUpload = async () => {
    if (!file || !patientId) return

    setUploading(true)
    try {
      const fileContent = await file.text()
      const jsonContent = JSON.parse(fileContent)

      // Get existing doctor uploads or initialize an empty array
      const doctorUploads = JSON.parse(localStorage.getItem("doctorUploads") || "{}")

      // Add the new upload to the patient's records
      if (!doctorUploads[patientId]) {
        doctorUploads[patientId] = []
      }
      doctorUploads[patientId].push({
        name: file.name,
        content: jsonContent,
        date: new Date().toISOString(),
        uploadedBy: "doctor",
      })

      // Save the updated doctor uploads
      localStorage.setItem("doctorUploads", JSON.stringify(doctorUploads))

      alert("Medical record uploaded successfully")
      setFile(null)
      setPatientId("")
    } catch (error) {
      console.error("Error uploading medical record:", error)
      alert("Error uploading medical record")
    }
    setUploading(false)
  }

  if (userRole !== "doctor") return null

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Upload Medical Record</h1>
      <div className="space-y-4">
        <div>
          <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">
            Patient ID
          </label>
          <input
            type="text"
            id="patientId"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="Enter patient ID"
          />
        </div>
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">
            JSON File
          </label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            accept="application/json"
            className="mt-1 block w-full"
          />
        </div>
        <button
          onClick={handleUpload}
          disabled={!file || !patientId || uploading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 w-full"
        >
          {uploading ? "Uploading..." : "Upload Medical Record"}
        </button>
      </div>
    </div>
  )
}

