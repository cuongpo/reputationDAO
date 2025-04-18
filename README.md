# Reputation DAO

A decentralized reputation scoring system where AI evaluates wallet behavior to assign trust scores. These scores are stored on-chain and used as voting power in a DAO on the Rootstock blockchain.

## System Architecture

```
User Wallet → Blockscout API → Backend API → OpenAI (GPT) → Score Result → ReputationOracle Smart Contract → ReputationDAO Smart Contract → DAO Frontend
```

## Components

- **Wallet data**: Blockscout API
- **AI engine**: OpenAI (GPT-4)
- **Backend API**: Express.js
- **Smart contracts**: Solidity + Thirdweb
- **DAO voting**: Custom weighted voting system
- **Frontend**: React + Thirdweb SDK
- **Chain**: Rootstock (Testnet/Mainnet)

## Smart Contracts

1. **ReputationOracle.sol** - Stores reputation scores on-chain
2. **ReputationDAO.sol** - Weighted voting based on reputation

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Metamask or another web3 wallet
- Rootstock testnet RPC configured in your wallet

### Frontend Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Update the contract addresses in `src/constants.js` after deploying the contracts.

3. Start the development server:
   ```
   npm start
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and fill in your API keys and configuration.

4. Start the server:
   ```
   npm start
   ```

### Smart Contract Deployment

1. Install Thirdweb CLI:
   ```
   npm install -g @thirdweb-dev/cli
   ```

2. Deploy the ReputationOracle contract:
   ```
   npx thirdweb deploy
   ```

3. Deploy the ReputationDAO contract, providing the address of the deployed ReputationOracle contract as a constructor parameter.

4. Update the contract addresses in both the frontend and backend configurations.

## API Endpoints

- **POST /api/score/:wallet** - Fetches wallet data, evaluates with AI, stores on-chain
- **GET /api/score/:wallet** - Returns latest reputation score from contract

## Frontend Features

- Connect Rootstock wallet
- View your reputation score
- Request scoring (on-demand)
- Create DAO proposals
- Vote on proposals (weighted by score)

## License

MIT
