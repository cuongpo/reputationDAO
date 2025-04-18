import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { BrowserRouter } from 'react-router-dom';

// Rootstock testnet chain configuration
const activeChain = {
  chainId: 31,
  rpc: ["https://public-node.testnet.rsk.co"],
  nativeCurrency: {
    name: "Test RSK Bitcoin",
    symbol: "tRBTC",
    decimals: 18,
  },
  shortName: "trsk",
  slug: "rsk-testnet",
  testnet: true,
  chain: "RSK Testnet",
  name: "RSK Testnet",
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThirdwebProvider activeChain={activeChain}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThirdwebProvider>
  </React.StrictMode>
);
