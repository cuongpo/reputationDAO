# Deployment Information

## Smart Contracts Deployed to Rootstock Testnet

| Contract | Address | Explorer Link |
|----------|---------|--------------|
| ReputationOracle | 0xABd3c4b7D19b4bb2fe8edfe0Cae9e8BCfefA558f | [View on Explorer](https://explorer.testnet.rsk.co/address/0xABd3c4b7D19b4bb2fe8edfe0Cae9e8BCfefA558f) |
| ReputationDAO | 0xc222001963d0F00B96C4DB6178Ef48f2F0DDe57C | [View on Explorer](https://explorer.testnet.rsk.co/address/0xc222001963d0F00B96C4DB6178Ef48f2F0DDe57C) |

## Deployment Wallet

- Address: 0x03Ae517C41d93B128bfDF9AB1F13bD54d50a8307
- Private Key: [REDACTED - stored in .env file]

## Next Steps

1. **Frontend Configuration**:
   - The contract addresses have been updated in `src/constants.js`
   - Copy the contents of `env-config.txt` to your `.env` file

2. **Backend Configuration**:
   - Copy the contents of `backend/env-config.txt` to your `backend/.env` file
   - Add your OpenAI API key to the `.env` file

3. **Start the Application**:
   - Start the backend: `cd backend && npm install && npm start`
   - Start the frontend: `npm start`

4. **Testing**:
   - Connect your wallet to the Rootstock testnet
   - Request a reputation score for your wallet
   - Create and vote on proposals

## Rootstock Testnet Information

- Network Name: Rootstock Testnet
- RPC URL: https://public-node.testnet.rsk.co
- Chain ID: 31
- Currency Symbol: tRBTC
- Block Explorer URL: https://explorer.testnet.rsk.co/

## Getting Testnet tRBTC

You can get testnet tRBTC from the [Rootstock Testnet Faucet](https://faucet.rootstock.io/).
