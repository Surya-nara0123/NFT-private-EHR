"use client"

import { useState, useEffect } from "react"
import { getNFTs, buyNFT } from "../utils/nftUtils"
import NFTCard from "../components/NFTCard"

export default function MarketplacePage() {
  const [nfts, setNfts] = useState<Array<any>>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchNFTs()
  }, [])

  const fetchNFTs = async () => {
    try {
      const fetchedNFTs = JSON.parse(localStorage.getItem("marketplaceListings")!);
      setNfts(fetchedNFTs)
    } catch (error) {
      console.error("Error fetching NFTs:", error)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredNFTs = nfts.filter((nft) => nft.tokenId.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleBuy = async (tokenId: string, type: string) => {
    try {
      const res = await fetch("http://127.0.0.1:3001/api/getId", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const body = await res.json()
      const id = body.result;
      await buyNFT(tokenId, id, type)
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
          <NFTCard key={nft.tokenId} nft={nft} onBuy={() => handleBuy(nft.tokenId, nft.fractionType)} />
        ))}
      </div>
    </div>
  )
}

