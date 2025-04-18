const { ThirdwebSDK } = require("@thirdweb-dev/sdk");
const { Wallet } = require("ethers");

// Define the Rootstock testnet chain
const rootstockTestnet = {
  chainId: 31,
  rpc: ["https://public-node.testnet.rsk.co"],
  nativeCurrency: {
    name: "Rootstock Bitcoin",
    symbol: "tRBTC",
    decimals: 18,
  },
  shortName: "trbtc",
  slug: "rootstock-testnet",
  testnet: true,
  chain: "Rootstock Testnet",
  name: "Rootstock Testnet"
};

async function main() {
  // Use the private key directly
  const privateKey = "4c4994a4fdd9588fee046e8f48a5ba540ee163c388fbddf3335123f85187a381";
  
  const wallet = new Wallet(privateKey);
  console.log("Using wallet address:", wallet.address);

  console.log("Initializing SDK...");
  const sdk = ThirdwebSDK.fromPrivateKey(privateKey, rootstockTestnet, {
    clientId: "thirdweb-example",
  });

  console.log("Deploying ReputationOracle contract...");
  const reputationOracleAddress = await sdk.deployer.deployContractFromAbi(
    "ReputationOracle",
    [
      {
        name: "constructor",
        type: "constructor",
        inputs: [],
        outputs: [],
        stateMutability: "nonpayable"
      }
    ],
    [],
    {
      contractName: "ReputationOracle",
      contractVersion: "1.0.0",
      publishMetadata: true,
    }
  );

  console.log(`ReputationOracle deployed to: ${reputationOracleAddress}`);

  console.log("Deploying ReputationDAO contract...");
  const reputationDAOAddress = await sdk.deployer.deployContractFromAbi(
    "ReputationDAO",
    [
      {
        name: "constructor",
        type: "constructor",
        inputs: [
          {
            name: "_reputationOracle",
            type: "address",
            internalType: "address"
          }
        ],
        outputs: [],
        stateMutability: "nonpayable"
      }
    ],
    [reputationOracleAddress],
    {
      contractName: "ReputationDAO",
      contractVersion: "1.0.0",
      publishMetadata: true,
    }
  );

  console.log(`ReputationDAO deployed to: ${reputationDAOAddress}`);
  
  console.log("\nDeployment completed successfully!");
  console.log("Update your .env and constants.js files with these addresses.");
  console.log(`REPUTATION_ORACLE_ADDRESS=${reputationOracleAddress}`);
  console.log(`REPUTATION_DAO_ADDRESS=${reputationDAOAddress}`);
  
  // Create a file with the addresses
  const fs = require('fs');
  fs.writeFileSync('deployed-addresses.txt', 
    `REPUTATION_ORACLE_ADDRESS=${reputationOracleAddress}\nREPUTATION_DAO_ADDRESS=${reputationDAOAddress}`
  );
  console.log("\nAddresses saved to deployed-addresses.txt");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during deployment:", error);
    process.exit(1);
  });
