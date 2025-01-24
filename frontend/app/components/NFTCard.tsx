interface NFTCardProps {
    nft: {
      tokenId: string
      metadata: {
        name: string
        description: string
        image: string
      }
      price: string
    }
    onBuy: (tokenId: string) => void
  }
  
  export default function NFTCard({ nft, onBuy }: NFTCardProps) {
    return (
      <div className="border rounded-lg p-4">
        <img
          src={nft.metadata.image || "/placeholder.svg"}
          alt={nft.metadata.name}
          className="w-full h-48 object-cover mb-2"
        />
        <h2 className="text-xl font-bold">{nft.metadata.name}</h2>
        <p className="text-gray-600 mb-2">{nft.metadata.description}</p>
        <p className="font-bold mb-2">Price: {nft.price} ETH</p>
        <button onClick={() => onBuy(nft.tokenId)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Buy
        </button>
      </div>
    )
  }
  
  