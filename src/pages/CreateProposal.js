import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddress, useContract, useContractWrite, useContractRead } from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { REPUTATION_DAO_ADDRESS, REPUTATION_DAO_ABI, REPUTATION_ORACLE_ADDRESS, REPUTATION_ORACLE_ABI } from '../constants';

const CreateProposal = () => {
  const navigate = useNavigate();
  const address = useAddress();
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Get DAO contract
  const { contract: daoContract } = useContract(
    REPUTATION_DAO_ADDRESS,
    [
      {
        "inputs": [{
          "internalType": "string",
          "name": "description",
          "type": "string"
        }],
        "name": "createProposal",
        "outputs": [{
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  );
  const { mutateAsync: createProposal } = useContractWrite(daoContract, "createProposal");
  
  // Get reputation contract and score
  const { contract: reputationContract } = useContract(
    REPUTATION_ORACLE_ADDRESS,
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
  
  const { data: reputationScore, isLoading: scoreLoading } = 
    useContractRead(reputationContract, "getReputation", [address || "0x0000000000000000000000000000000000000000"]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!address) {
      setError('Please connect your wallet');
      return;
    }
    
    if (!description.trim()) {
      setError('Please enter a proposal description');
      return;
    }
    
    if (reputationScore?.toNumber() === 0) {
      setError('You need a reputation score to create proposals');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Call the createProposal function on the contract
      // Add overrides to ensure the transaction has enough gas and proper configuration
      const data = await createProposal({
        args: [description],
        overrides: {
          gasLimit: 1000000, // Significantly increase gas limit for Rootstock
          gasPrice: ethers.utils.parseUnits("0.06", "gwei"), // Set an appropriate gas price
          from: address // Explicitly set the sender address
        }
      });
      console.log("Proposal created:", data);
      
      // Redirect to proposals page
      navigate('/proposals');
    } catch (err) {
      console.error("Error creating proposal:", err);
      // Provide more user-friendly error message
      if (err.message && err.message.includes("reverted")) {
        setError('Transaction reverted. You may not have enough reputation score or permission to create a proposal.');
      } else if (err.message && err.message.includes("gas")) {
        setError('Transaction failed due to gas issues. Please try again with higher gas limits.');
      } else if (err.message && err.message.includes("rejected")) {
        setError('Transaction was rejected by your wallet. Please try again.');
      } else if (err.message && err.message.includes("network")) {
        setError('Network error. Please ensure you are connected to Rootstock testnet.');
      } else {
        setError(err.message || 'Failed to create proposal');
      }
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <h1>Create Proposal</h1>
      
      {!address ? (
        <div className="card">
          <p>Please connect your wallet to create a proposal.</p>
        </div>
      ) : scoreLoading ? (
        <div className="spinner"></div>
      ) : reputationScore?.toNumber() === 0 ? (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Reputation Required</h2>
          </div>
          <div className="card-body">
            <p>You need a reputation score to create proposals.</p>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/reputation')}
              style={{ marginTop: '15px' }}
            >
              Get Reputation Score
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">New Proposal</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Proposal Description
                </label>
                <textarea
                  id="description"
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your proposal..."
                  required
                />
                <small style={{ display: 'block', marginTop: '5px', color: '#6c757d' }}>
                  Be clear and concise. Explain what you're proposing and why it matters.
                </small>
              </div>
              
              {error && (
                <div className="error-message" style={{ color: 'var(--danger)', marginBottom: '15px' }}>
                  {error}
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/proposals')}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProposal;
