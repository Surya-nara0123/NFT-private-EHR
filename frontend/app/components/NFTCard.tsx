interface NFTCardProps {
    nft: {
      tokenId: string
      category: string
      date: string
      price: string
    }
    onBuy: (tokenId: string) => void
  }
  interface MintedNFTPublic {
    tokenId: string
    // ipfsHash: string
    category: string
    date: string
    price?: string
  }
  export default function NFTCard({ nft, onBuy }: NFTCardProps) {
    return (
      <div className="border rounded-lg p-4">
        <img
          src={"/placeholder.svg"}
          alt={nft.tokenId}
          className="w-full h-48 object-cover mb-2"
        />
        <h2 className="text-xl font-bold">{nft.tokenId}</h2>
        <p className="text-gray-600 mb-2">Meow Meow</p>
        <p className="font-bold mb-2">Price: {nft.price} ETH</p>
        <button onClick={() => onBuy(nft.tokenId)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Buy
        </button>
      </div>
    )
  }
  
  