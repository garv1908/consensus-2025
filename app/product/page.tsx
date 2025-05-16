"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WalletSelect } from "@/components/account/wallet-select";
import { usePolkadotExtension } from "@/providers/polkadot-extension-provider";
import { sr25519CreateDerive } from "@polkadot-labs/hdkd"
import {
  DEV_PHRASE,
  entropyToMiniSecret,
  mnemonicToEntropy,
} from "@polkadot-labs/hdkd-helpers"
import { getPolkadotSigner } from "polkadot-api/signer"
import { createClient, Enum } from "polkadot-api"
import { westend_asset_hub } from "@polkadot-api/descriptors";
import { MultiAddress, wnd } from "@polkadot-api/descriptors"
import { chainSpec } from "polkadot-api/chains/westend2"
import { getSmProvider } from "polkadot-api/sm-provider"
// import { ApiPromise, WsProvider } from "@polkadot/api";
import { web3FromSource } from "@polkadot/extension-dapp";

import {
  getInjectedExtensions,
  connectInjectedExtension,
} from "polkadot-api/pjs-signer"
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";

export default function ProductMintPage() {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [serial, setSerial] = useState("");
  const [minting, setMinting] = useState(false);
  const [mintedHash, setMintedHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { selectedAccount } = usePolkadotExtension();
  const [copied, setCopied] = useState(false);


  // TODO: Implement actual mint logic using polkadot-api
  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    setMinting(true);
    setError(null);
    setMintedHash(null);

    try {
      if (!selectedAccount) throw new Error("Wallet not connected");

      // let's create Alice signer
      const miniSecret = entropyToMiniSecret(mnemonicToEntropy(DEV_PHRASE))
      const derive = sr25519CreateDerive(miniSecret)
      const aliceKeyPair = derive("//Alice")
      const alice = getPolkadotSigner(
        aliceKeyPair.publicKey,
        "Sr25519",
        aliceKeyPair.sign,
      )

      let rpcUrl = "wss://asset-hub-westend-rpc.dwellir.com"
      let provider = getWsProvider(rpcUrl)
      const client = createClient(withPolkadotSdkCompat(provider))
      const api = client.getTypedApi(westend_asset_hub)
      console.log("api:", api)
      
      const accountHash = selectedAccount.address

      const accountInfo = await api.query.System.Account.getValue(accountHash)
      console.log("accountInfo:", accountInfo)

      const tx = api.tx.Nfts.create(
        {
          admin: MultiAddress.Id(accountHash),
          config: {
            max_supply: 100,
            mint_settings: {
                default_item_settings: BigInt(0),
                end_block: 21720882,
                mint_type: Enum("Public"),
                price: BigInt(0),
                start_block: 11720962,
            },
            settings: BigInt(0),
          }
        }
      )

      tx.signAndSubmit(selectedAccount.polkadotSigner)
      .then((result) => {
        console.log("result:", result)
        // setMintedHash(result)
      })

      // // const api = await ApiPromise.create({ provider: new WsProvider("wss://asset-hub-westend-rpc.dwellir.com") });
      // console.log(selectedAccount)
      // // const nft = api.tx.nfts.create()
      // // const injector = await web3FromSource(selectedAccount.meta.source);
      // const nft = await api.tx.nfts.create(selectedAccount.address, 0x00,);
      // console.log("nft:", nft.toHuman())
      
      // const hash = await nft.(selectedAccount);
      // console.log("hash:", hash.toHuman())

      


    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to mint NFT.");
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
              defaultValue="Hermes Birkin Handbag"
              // value={productName}
              onChange={e => setProductName(e.target.value)}
              required
            />
            <Textarea
              placeholder="Description"
              defaultValue="A very valuable handbag"
              // value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
            <Input
              placeholder="Serial Number"
              defaultValue="00010"
              // value={serial}
              onChange={e => setSerial(e.target.value)}
              required
            />
            <WalletSelect />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {mintedHash && (
              <div className="flex flex-col gap-2 items-center text-green-600 text-sm">
                <div>
                  NFT minted! {/* Token ID: <span className="font-mono">{mintedHash}</span> */}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-black select-all">{mintedHash}</span>
                    <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await navigator.clipboard.writeText(mintedHash!);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 500);
                    }}
                    >
                    {copied ? "Copied" : "Copy hash"}
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
