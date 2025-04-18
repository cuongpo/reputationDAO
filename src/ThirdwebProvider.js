import React from 'react';
import { ThirdwebProvider as TWProvider } from '@thirdweb-dev/react';

// Rootstock testnet chain configuration
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

const ThirdwebProvider = ({ children }) => {
  return (
    <TWProvider 
      activeChain={rootstockTestnet}
      clientId={process.env.REACT_APP_THIRDWEB_CLIENT_ID || "thirdweb-example"}
      supportedChains={[rootstockTestnet]}
      dAppMeta={{
        name: "Reputation DAO",
        description: "AI-Powered Reputation Oracle + DAO",
        logoUrl: "",
        url: window.location.origin,
      }}
    >
      {children}
    </TWProvider>
  );
};

export default ThirdwebProvider;
