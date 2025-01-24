import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "./components/Navbar"
import { UserProvider } from "./context/UserContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "NFT EHR Management",
  description: "Manage Electronic Health Records using NFTs",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-8">{children}</main>
        </UserProvider>
      </body>
    </html>
  )
}

