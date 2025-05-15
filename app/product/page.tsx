"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WalletSelect } from "@/components/account/wallet-select";
import { usePolkadotExtension } from "@/providers/polkadot-extension-provider";
import { westend_asset_hub } from "@polkadot-api/descriptors";

export default function ProductMintPage() {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [serial, setSerial] = useState("");
  const [minting, setMinting] = useState(false);
  const [mintedHash, setMintedHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { selectedAccount } = usePolkadotExtension();

  // TODO: Implement actual mint logic using polkadot-api
  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setMinting(true);
    setError(null);
    setMintedHash(null);
    try {
      // Call mint NFT transaction here
      // Example: const hash = await mintNft({ productName, description, serial });
      const hash = "0x123...abc"; // stub
      setMintedHash(hash);
    } catch (err: any) {
      setError("Failed to mint NFT. Please try again.");
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Mint Product NFT</CardTitle>
        </CardHeader>
        <form onSubmit={handleMint}>
          <CardContent className="flex flex-col gap-4">
            <Input
              placeholder="Product Name"
              value={productName}
              onChange={e => setProductName(e.target.value)}
              required
            />
            <Textarea
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
            <Input
              placeholder="Serial Number"
              value={serial}
              onChange={e => setSerial(e.target.value)}
              required
            />
            <WalletSelect />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {mintedHash && (
              <div className="flex flex-col gap-2 items-center text-green-600 text-sm">
                <div>
                  NFT minted! Token ID: <span className="font-mono">{mintedHash}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-black select-all">{mintedHash}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(mintedHash);
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={minting} className="w-full">
              {minting ? "Minting..." : "Mint NFT"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
