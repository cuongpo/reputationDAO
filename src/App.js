import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAddress, useContract, useContractRead, ConnectWallet } from "@thirdweb-dev/react";
import './App.css';

// Components
import Navbar from './components/Navbar';
import NetworkAlert from './components/NetworkAlert';
import Home from './pages/Home';
import Reputation from './pages/Reputation';
import Proposals from './pages/Proposals';
import CreateProposal from './pages/CreateProposal';
import ProposalDetails from './pages/ProposalDetails';

// Contract ABIs and addresses
import { REPUTATION_ORACLE_ADDRESS, REPUTATION_DAO_ADDRESS } from './constants';

function App() {
  const address = useAddress();
  
  // Only try to get reputation score if we have a valid contract address and user is connected
  const isValidContractAddress = REPUTATION_ORACLE_ADDRESS && 
    REPUTATION_ORACLE_ADDRESS !== "0x0000000000000000000000000000000000000000";
  
  const { contract: reputationContract } = useContract(
    isValidContractAddress ? REPUTATION_ORACLE_ADDRESS : undefined,
    [
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
    ]
  );
  
  const { data: reputationScore, isLoading: reputationLoading } = useContractRead(
    reputationContract,
    "getReputation",
    [address || "0x0000000000000000000000000000000000000000"]
  );

  return (
    <div className="app">
      <NetworkAlert />
      <Navbar />
      
      <div className="container">
        <div className="wallet-container">
          <ConnectWallet />
          {address && !reputationLoading && isValidContractAddress ? (
            <div className="reputation-badge">
              Reputation: {reputationScore?.toNumber() || 0}/100
            </div>
          ) : address && isValidContractAddress ? (
            <div className="reputation-badge">Loading reputation...</div>
          ) : address ? (
            <div className="reputation-badge">Contract not deployed yet</div>
          ) : null}
        </div>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reputation" element={<Reputation />} />
          <Route path="/proposals" element={<Proposals />} />
          <Route path="/proposals/create" element={<CreateProposal />} />
          <Route path="/proposals/:id" element={<ProposalDetails />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
