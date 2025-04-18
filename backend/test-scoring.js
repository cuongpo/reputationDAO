require('dotenv').config();
const axios = require('axios');
const { ethers } = require('ethers');
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Ethers provider and contract
const provider = new ethers.providers.JsonRpcProvider(process.env.ROOTSTOCK_TESTNET_RPC);
const wallet = process.env.PRIVATE_KEY ? new ethers.Wallet(process.env.PRIVATE_KEY, provider) : null;

// ReputationOracle ABI (minimal for our needs)
const REPUTATION_ORACLE_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "score",
        "type": "uint256"
      }
    ],
    "name": "storeReputation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{
      "internalType": "address",
      "name": "user",
      "type": "address"
    }],
    "name": "getReputation",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }
];

// Initialize contract if we have the address
let reputationOracleContract = null;
if (process.env.REPUTATION_ORACLE_ADDRESS && process.env.REPUTATION_ORACLE_ADDRESS !== "0x0000000000000000000000000000000000000000" && wallet) {
  reputationOracleContract = new ethers.Contract(
    process.env.REPUTATION_ORACLE_ADDRESS,
    REPUTATION_ORACLE_ABI,
    wallet
  );
  console.log("Contract initialized with address:", process.env.REPUTATION_ORACLE_ADDRESS);
} else {
  console.log("Contract not initialized. Check environment variables:");
  console.log("REPUTATION_ORACLE_ADDRESS:", process.env.REPUTATION_ORACLE_ADDRESS);
  console.log("PRIVATE_KEY configured:", !!process.env.PRIVATE_KEY);
}

// Test wallet address
const testWalletAddress = "0x03Ae517C41d93B128bfDF9AB1F13bD54d50a8307";

// Helper function to fetch wallet data from Blockscout
async function fetchWalletData(walletAddress) {
  try {
    console.log("Fetching wallet data for:", walletAddress);
    
    // Validate address
    if (!ethers.utils.isAddress(walletAddress)) {
      throw new Error('Invalid wallet address');
    }
    
    // Get basic address info from v2 API
    console.log("Fetching address info from v2 API...");
    const addressInfoUrl = `${process.env.BLOCKSCOUT_API_URL}/v2/addresses/${walletAddress}`;
    console.log("URL:", addressInfoUrl);
    
    const addressInfoResponse = await axios.get(addressInfoUrl);
    console.log("Address info response:", JSON.stringify(addressInfoResponse.data, null, 2));
    
    // Use the API endpoint for transaction count
    console.log("Fetching transaction count...");
    const txCountUrl = `${process.env.BLOCKSCOUT_API_URL}`;
    console.log("URL:", txCountUrl);
    
    const txCountResponse = await axios.get(txCountUrl, {
      params: {
        module: 'account',
        action: 'txlist',
        address: walletAddress,
        page: 1,
        offset: 1,
        sort: 'asc'
      }
    });
    console.log("Transaction count response:", JSON.stringify(txCountResponse.data, null, 2));
    
    // Compile wallet data
    const walletData = {
      address: walletAddress,
      txCount: txCountResponse.data.result ? txCountResponse.data.result.length : 0,
      walletAge: 0, // We'll calculate this if there are transactions
      contractInteractions: 0, // We'll calculate this later
      tokenDiversity: 0, // We'll calculate this later
      suspiciousActivity: 'No' // This would require more sophisticated analysis
    };
    
    // Calculate wallet age in days (if there are transactions)
    if (txCountResponse.data.result && txCountResponse.data.result.length > 0) {
      const firstTxTimestamp = parseInt(txCountResponse.data.result[0].timeStamp) * 1000;
      const currentTimestamp = Date.now();
      walletData.walletAge = Math.floor((currentTimestamp - firstTxTimestamp) / (1000 * 60 * 60 * 24));
    }
    
    // Get contract interactions
    console.log("Fetching contract interactions...");
    const contractTxResponse = await axios.get(`${process.env.BLOCKSCOUT_API_URL}`, {
      params: {
        module: 'account',
        action: 'txlist',
        address: walletAddress,
        page: 1,
        offset: 100
      }
    });
    console.log("Contract interactions response:", JSON.stringify(contractTxResponse.data, null, 2));
    
    // Count unique contracts interacted with
    const uniqueContracts = new Set();
    if (contractTxResponse.data.result) {
      contractTxResponse.data.result.forEach(tx => {
        if (tx.to && tx.input && tx.input !== '0x') {
          uniqueContracts.add(tx.to);
        }
      });
    }
    walletData.contractInteractions = uniqueContracts.size;
    
    // Get token balances
    console.log("Fetching token balances...");
    const tokenBalancesResponse = await axios.get(`${process.env.BLOCKSCOUT_API_URL}`, {
      params: {
        module: 'account',
        action: 'tokenlist',
        address: walletAddress
      }
    });
    console.log("Token balances response:", JSON.stringify(tokenBalancesResponse.data, null, 2));
    
    walletData.tokenDiversity = tokenBalancesResponse.data.result ? tokenBalancesResponse.data.result.length : 0;
    
    console.log('Wallet data compiled:', walletData);
    return walletData;
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    throw new Error(`Failed to fetch wallet data: ${error.message}`);
  }
}

// Helper function to evaluate wallet with OpenAI
async function evaluateWallet(walletData) {
  try {
    console.log("Evaluating wallet with OpenAI...");
    const prompt = `
You're an AI reputation engine. Based on the following wallet data, return a score from 0 to 100 with a reason.

- Tx count: ${walletData.txCount}
- Wallet age: ${walletData.walletAge} days
- Contract interactions: ${walletData.contractInteractions}
- Token diversity: ${walletData.tokenDiversity}
- Suspicious activity: ${walletData.suspiciousActivity}

Respond in JSON:
{"score": <number>, "reason": "<explanation>"}
`;

    console.log("OpenAI prompt:", prompt);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a blockchain reputation scoring system. You analyze wallet activity and provide a reputation score from 0-100." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    // Parse the JSON response from OpenAI
    const content = response.choices[0].message.content.trim();
    console.log("OpenAI response:", content);
    
    const evaluation = JSON.parse(content);
    console.log("Parsed evaluation:", evaluation);
    
    return evaluation;
  } catch (error) {
    console.error('Error evaluating wallet with OpenAI:', error);
    throw new Error(`Failed to evaluate wallet: ${error.message}`);
  }
}

// Helper function to store score on-chain
async function storeScoreOnChain(walletAddress, score) {
  try {
    console.log("Storing score on-chain...");
    console.log("Wallet address:", walletAddress);
    console.log("Score:", score);
    
    if (!reputationOracleContract || !wallet) {
      throw new Error('Contract or wallet not initialized');
    }
    
    console.log("Sending transaction to store reputation...");
    const tx = await reputationOracleContract.storeReputation(walletAddress, score);
    console.log("Transaction sent:", tx.hash);
    
    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);
    
    return {
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('Error storing score on-chain:', error);
    throw new Error(`Failed to store score on-chain: ${error.message}`);
  }
}

// Helper function to get score from chain
async function getScoreFromChain(walletAddress) {
  try {
    console.log("Getting score from chain...");
    console.log("Wallet address:", walletAddress);
    
    if (!reputationOracleContract) {
      throw new Error('Contract not initialized');
    }
    
    // For read operations, we can use the provider directly
    const readOnlyContract = new ethers.Contract(
      process.env.REPUTATION_ORACLE_ADDRESS,
      REPUTATION_ORACLE_ABI,
      provider
    );
    
    console.log("Calling getReputation...");
    const score = await readOnlyContract.getReputation(walletAddress);
    console.log("Score from chain:", score.toNumber());
    
    return score.toNumber();
  } catch (error) {
    console.error('Error getting score from chain:', error);
    throw new Error(`Failed to get score from chain: ${error.message}`);
  }
}

// Run the test
async function runTest() {
  try {
    console.log("Starting test...");
    console.log("Environment variables:");
    console.log("BLOCKSCOUT_API_URL:", process.env.BLOCKSCOUT_API_URL);
    console.log("ROOTSTOCK_TESTNET_RPC:", process.env.ROOTSTOCK_TESTNET_RPC);
    console.log("REPUTATION_ORACLE_ADDRESS:", process.env.REPUTATION_ORACLE_ADDRESS);
    console.log("OpenAI API Key configured:", !!process.env.OPENAI_API_KEY);
    
    // Fetch wallet data
    const walletData = await fetchWalletData(testWalletAddress);
    
    // Evaluate wallet with OpenAI
    const evaluation = await evaluateWallet(walletData);
    
    // Store score on-chain
    const txInfo = await storeScoreOnChain(testWalletAddress, evaluation.score);
    
    console.log("Test completed successfully!");
    console.log("Wallet:", testWalletAddress);
    console.log("Score:", evaluation.score);
    console.log("Reason:", evaluation.reason);
    console.log("Transaction:", txInfo);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the test
runTest();
