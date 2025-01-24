"use client"

import { useState, useEffect } from "react"
import { getNFTs, buyNFT } from "../utils/nftUtils"
import NFTCard from "../components/NFTCard"

export default function MarketplacePage() {
  const [nfts, setNfts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchNFTs()
  }, [])

  const fetchNFTs = async () => {
    const fetchedNFTs = await getNFTs()
    setNfts(fetchedNFTs)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredNFTs = nfts.filter((nft) => nft.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleBuy = async (tokenId: string) => {
    try {
      await buyNFT(tokenId)
      // Refresh NFTs after purchase
      fetchNFTs()
    } catch (error) {
      console.error("Error buying NFT:", error)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">NFT Marketplace</h1>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search NFTs"
        className="border p-2 mb-4 w-full"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNFTs.map((nft) => (
          <NFTCard key={nft.tokenId} nft={nft} onBuy={handleBuy} />
        ))}
      </div>
    </div>
  )
}

