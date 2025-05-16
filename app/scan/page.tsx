"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { westend_asset_hub } from "@polkadot-api/descriptors";
import test from "node:test";

interface ProductMeta {
  name: string;
  description: string;
  serial: string;
}

export default function ScanPage() {
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<ProductMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMeta(null);
    setVerified(false);

    try {
      // Expect hash as "collectionId-itemId" (?)
      // const [collectionId, itemId] = hash.split("-").map(Number);
      // if (isNaN(collectionId) || isNaN(itemId)) {
      //   throw new Error("Invalid NFT hash format. Use collectionId-itemId.");
      // }

      const rpcUrl = "wss://asset-hub-westend-rpc.dwellir.com";
      const provider = getWsProvider(rpcUrl);
      const client = createClient(withPolkadotSdkCompat(provider));
      const api = client.getTypedApi(westend_asset_hub);

      // Query item metadata (assuming metadata is stored as system attribute "product")
      const key = new TextEncoder().encode("product");
      // const metaOpt = await api.query.Nfts.system_attribute.get(collectionId, itemId, key);
      const list = await api.query.Nfts.Item.getEntries();
      

      // if (!list || !metaOpt.isSome) {
      //   throw new Error("NFT not found or has no metadata.");
      // }

      // const metaJson = new TextDecoder().decode(metaOpt.value);
      // const parsed: ProductMeta = JSON.parse(metaJson);
      const testMeta = {
        name: "Hermes Birkin Handbag",
        description: "A very valuable handbaga",
        serial: "00010",
      }
      setMeta(testMeta);
      setVerified(true);
    } catch (err: any) {
      setError(err.message || "NFT not found.");
    } finally {
      setLoading(false);
    }
  };

  // Camera setup
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        setCameraError("Camera access denied or unavailable.");
      }
    };
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Scan NFT Authenticity</CardTitle>
        </CardHeader>
        <form onSubmit={handleSearch}>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col items-center">
              <video ref={videoRef} autoPlay playsInline muted width={320} height={240} className="rounded bg-black mb-2" style={{objectFit: 'cover'}} />
              {cameraError && <div className="text-red-500 text-xs">{cameraError}</div>}
              <span className="text-xs text-gray-500">Camera is on.</span>
            </div>
            <Input
              placeholder="Enter NFT hash (collectionId-itemId)"
              value={hash}
              onChange={e => setHash(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Verify"}
            </Button>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {meta && (
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{meta.name}</span>
                  {verified && <span className="text-green-600 text-xl">✅ Verified</span>}
                </div>
                <div className="text-gray-700">{meta.description}</div>
                <div className="text-gray-500 text-sm">Serial: {meta.serial}</div>
              </div>
            )}
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
