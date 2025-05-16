import { RulesEngine, policyModifierGeneration } from "@thrackle-io/forte-rules-engine-sdk";
import * as fs from "fs";
import { connectConfig } from "@thrackle-io/forte-rules-engine-sdk/config";
import {
  Address,
  createClient,
  getAddress,
  http,
  PrivateKeyAccount,
  publicActions,
  walletActions,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { Config, createConfig, mock } from "@wagmi/core";
import { baseSepolia, foundry } from "@wagmi/core/chains";
import * as dotenv from "dotenv";

dotenv.config();

// Load required env vars
const RULES_ENGINE_ADDRESS: Address = getAddress(process.env.RULES_ENGINE_ADDRESS!);
const foundryPrivateKey: `0x${string}` = process.env.PRIV_KEY! as `0x${string}`;
export const account: PrivateKeyAccount = privateKeyToAccount(foundryPrivateKey);
const foundryAccountAddress: `0x${string}` = process.env.USER_ADDRESS! as `0x${string}`;

let config: Config;
let RULES_ENGINE: RulesEngine;

const createTestConfig = async () => {
  config = createConfig({
    chains: [process.env.LOCAL_CHAIN === "TRUE" ? foundry : baseSepolia],
    client({ chain }) {
      return createClient({
        chain,
        transport: http(process.env.RPC_URL!),
        account,
      })
        .extend(walletActions)
        .extend(publicActions);
    },
    connectors: [
      mock({
        accounts: [foundryAccountAddress],
      }),
    ],
  });
};

async function setupPolicy(policyData: string): Promise<number> {
  const result = await RULES_ENGINE.createPolicy(policyData);
  console.log(`✅ Policy '${result.policyId}' created successfully.`);
  return result.policyId;
}

async function injectModifiers(policyJSONFile: string, modifierFileName: string, sourceContractFile: string) {
  policyModifierGeneration(policyJSONFile, modifierFileName, [sourceContractFile]);
  console.log("✅ Modifiers injected.");
}

async function applyPolicy(policyId: number, contractAddress: Address) {
  await validatePolicyId(policyId);
  await RULES_ENGINE.appendPolicy(policyId, contractAddress);
  console.log("✅ Policy applied to contract.");
}

async function validatePolicyId(policyId: number): Promise<boolean> {
  if (isNaN(policyId) || policyId <= 0) throw new Error("❌ Invalid policy ID.");
  const exists = await RULES_ENGINE.policyExists(policyId);
  if (!exists) throw new Error(`❌ Policy ID ${policyId} does not exist.`);
  return true;
}

async function main() {
  await createTestConfig();
  const client = config.getClient({ chainId: config.chains[0].id });
  RULES_ENGINE = new RulesEngine(RULES_ENGINE_ADDRESS, config, client);
  await connectConfig(config, 0);

  const command = process.argv[2];

  switch (command) {
    case "setupPolicy":
      const policyFile = process.argv[3] || "policy.json";
      const policyData = fs.readFileSync(policyFile, "utf8");
      await setupPolicy(policyData);
      break;

    case "injectModifiers":
      await injectModifiers(
        process.argv[3] || "policy.json",
        process.argv[4] || "src/RulesEngineIntegration.sol",
        process.argv[5] || "src/YourContract.sol"
      );
      break;

    case "applyPolicy":
      const policyId = Number(process.argv[3]);
      const contractAddr = getAddress(process.argv[4]);
      await applyPolicy(policyId, contractAddr);
      break;

    default:
      console.log("❌ Invalid command.\nAvailable commands:");
      console.log("   setupPolicy <policyJSONFile>");
      console.log("   injectModifiers <policyJSONFile> <modFile> <sourceContract>");
      console.log("   applyPolicy <policyId> <contractAddress>");
  }
}

main().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});
