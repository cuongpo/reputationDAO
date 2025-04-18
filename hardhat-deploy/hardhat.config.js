require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Use the private key directly in the config for simplicity
// In a production environment, always use environment variables
const PRIVATE_KEY = "4c4994a4fdd9588fee046e8f48a5ba540ee163c388fbddf3335123f85187a381";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    "rootstock-testnet": {
      url: "https://public-node.testnet.rsk.co",
      chainId: 31,
      accounts: [PRIVATE_KEY],
      gasPrice: 60000000 // 0.06 gwei
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
