import React, { useEffect, useState } from 'react';
import { useNetwork, useChain } from '@thirdweb-dev/react';

const NetworkAlert = () => {
  // Always set showAlert to false to disable the network alert popup
  const [showAlert, setShowAlert] = useState(false);
  const network = useNetwork();
  const chainId = useChain();
  
  // Commenting out the effect to prevent the alert from showing
  /*
  useEffect(() => {
    // Check if connected and if the chain is Rootstock testnet (chain ID 31)
    if (network[0].data.chain && chainId !== 31) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  }, [network, chainId]);
  */

  if (!showAlert) {
    return null;
  }

  const switchToRootstock = async () => {
    try {
      const ethereum = window.ethereum;
      if (!ethereum) throw new Error("No crypto wallet found");
      
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0x1F", // 31 in hexadecimal
          chainName: "Rootstock Testnet",
          nativeCurrency: {
            name: "Rootstock Bitcoin",
            symbol: "tRBTC",
            decimals: 18
          },
          rpcUrls: ["https://public-node.testnet.rsk.co"],
          blockExplorerUrls: ["https://explorer.testnet.rsk.co/"]
        }]
      });
      
      // After adding the chain, try to switch to it
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x1F" }]
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      backgroundColor: '#f44336',
      color: 'white',
      padding: '10px',
      textAlign: 'center',
      zIndex: '1000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <p style={{ margin: '0 10px' }}>
        Please switch to the Rootstock Testnet to use this application
      </p>
      <button
        onClick={switchToRootstock}
        style={{
          backgroundColor: 'white',
          color: '#f44336',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Switch Network
      </button>
    </div>
  );
};

export default NetworkAlert;
