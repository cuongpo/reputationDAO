# Reputation DAO User Guide

## Introduction

Reputation DAO is a decentralized reputation scoring system that uses AI to evaluate wallet behavior on the Rootstock blockchain. The system assigns trust scores based on on-chain activity, which are then used as voting power in the DAO governance.

## Getting Started

### Prerequisites

- A web3 wallet (MetaMask, Rabby, etc.)
- Some tRBTC (Rootstock Testnet Bitcoin) for gas fees
- Connection to the Rootstock Testnet (Chain ID: 31)

### Connecting Your Wallet

1. Visit the Reputation DAO application
2. Click "Connect Wallet" in the top-right corner
3. Select your preferred wallet provider
4. If prompted, switch to the Rootstock Testnet

## Features

### Reputation Scoring

Your reputation score is calculated based on your on-chain activity:

1. **Transaction history** - Number and frequency of transactions
2. **Wallet age** - How long your wallet has been active
3. **Contract interactions** - Diversity of smart contracts used
4. **Token diversity** - Variety of tokens held
5. **Transaction patterns** - Analysis of transaction behavior

To get your reputation score:

1. Navigate to the "Reputation" page
2. Click "Calculate Score"
3. Wait for the AI to analyze your wallet and generate a score
4. Your score will be stored on-chain and displayed in the UI

### DAO Governance

Once you have a reputation score, you can participate in DAO governance:

1. **View Proposals** - See all active and past proposals
2. **Create Proposals** - Submit new proposals for the community to vote on (requires a minimum reputation score)
3. **Vote on Proposals** - Cast votes with weight proportional to your reputation score
4. **Execute Proposals** - Proposals that pass can be executed after the voting period ends

## Technical Details

### Smart Contracts

The system uses two main smart contracts:

1. **ReputationOracle** - Stores reputation scores on-chain
2. **ReputationDAO** - Handles proposal creation, voting, and execution

### Backend API

The backend API handles:

1. Fetching wallet data from Blockscout
2. Sending data to OpenAI for evaluation
3. Storing results on-chain via the ReputationOracle contract

### Frontend

The React frontend provides a user interface for:

1. Connecting wallets
2. Viewing and calculating reputation scores
3. Creating and voting on proposals
4. Executing passed proposals

## Troubleshooting

### Common Issues

1. **Cannot connect wallet** - Ensure you're using a supported wallet and have the Rootstock Testnet configured
2. **Transaction failing** - Make sure you have enough tRBTC for gas fees
3. **Score not updating** - The scoring process involves multiple steps and may take some time to complete
4. **Cannot vote** - You need a reputation score greater than 0 to vote

### Getting Help

If you encounter issues:

1. Check the documentation
2. Look for error messages in the console
3. Contact the development team through the project's GitHub repository

## Development

For developers who want to contribute to the project:

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file based on `.env.example`
4. Start the frontend with `npm start`
5. Start the backend with `cd backend && npm start`

## License

MIT License
