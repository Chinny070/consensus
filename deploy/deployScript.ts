import { readFileSync, writeFileSync } from "fs";
import path from "path";
import {
  TransactionHash,
  TransactionStatus,
  GenLayerClient,
  DecodedDeployData,
  GenLayerChain,
} from "genlayer-js/types";

export default async function main(client: GenLayerClient<any>) {
  const filePath = path.resolve(process.cwd(), "contracts/consensus.py");

  try {
    const contractCode = new Uint8Array(readFileSync(filePath));
    console.log("Deploying Consensus contract...");

    await client.initializeConsensusSmartContract();

    const deployTransaction: TransactionHash = await client.deployContract({
      code: contractCode,
      args: [],
    });

    console.log("Deployment tx:", deployTransaction);

    const receipt = await client.waitForTransactionReceipt({
      hash: deployTransaction,
      status: TransactionStatus.ACCEPTED,
      retries: 200,
    });

    if (!receipt) {
      throw new Error("No receipt returned");
    }

    const chain = client.chain as GenLayerChain;
    let contractAddress: string;

    if (chain.id === 0) {
      contractAddress = (receipt as any).data?.contract_address;
    } else {
      contractAddress = (receipt.txDataDecoded as DecodedDeployData)
        ?.contractAddress;
    }

    if (!contractAddress) {
      throw new Error("Could not extract contract address from receipt");
    }

    console.log("Consensus deployed at:", contractAddress);

    const addressesPath = path.resolve(process.cwd(), "deploy/addresses.json");
    writeFileSync(
      addressesPath,
      JSON.stringify({ consensus: contractAddress, network: "studionet", chainId: 61999 }, null, 2)
    );
    console.log("Address saved to deploy/addresses.json");

    return contractAddress;
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}
