// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying contracts to Rootstock testnet...");
  
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  
  // Check balance
  const balance = await deployer.getBalance();
  console.log(`Account balance: ${hre.ethers.utils.formatEther(balance)} RBTC`);
  
  // Deploy ReputationOracle
  console.log("Deploying ReputationOracle...");
  const ReputationOracle = await hre.ethers.getContractFactory("ReputationOracle");
  const reputationOracle = await ReputationOracle.deploy();
  await reputationOracle.deployed();
  console.log(`ReputationOracle deployed to: ${reputationOracle.address}`);
  
  // Deploy ReputationDAO
  console.log("Deploying ReputationDAO...");
  const ReputationDAO = await hre.ethers.getContractFactory("ReputationDAO");
  const reputationDAO = await ReputationDAO.deploy(reputationOracle.address);
  await reputationDAO.deployed();
  console.log(`ReputationDAO deployed to: ${reputationDAO.address}`);
  
  // Save the contract addresses
  const addresses = {
    REPUTATION_ORACLE_ADDRESS: reputationOracle.address,
    REPUTATION_DAO_ADDRESS: reputationDAO.address
  };
  
  // Save to a file in the hardhat-deploy directory
  fs.writeFileSync(
    path.join(__dirname, "../deployed-addresses.json"),
    JSON.stringify(addresses, null, 2)
  );
  console.log("Contract addresses saved to deployed-addresses.json");
  
  // Also save to a file in the parent directory for the frontend
  fs.writeFileSync(
    path.join(__dirname, "../../deployed-addresses.json"),
    JSON.stringify(addresses, null, 2)
  );
  console.log("Contract addresses also saved to parent directory");
  
  // Print instructions
  console.log("\nDeployment completed successfully!");
  console.log("Next steps:");
  console.log("1. Update your .env file with these addresses");
  console.log("2. Update the constants.js file in the frontend");
  console.log(`REPUTATION_ORACLE_ADDRESS=${reputationOracle.address}`);
  console.log(`REPUTATION_DAO_ADDRESS=${reputationDAO.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
