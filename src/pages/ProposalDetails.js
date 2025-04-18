import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAddress, useContract, useContractRead, useContractWrite } from "@thirdweb-dev/react";
import { REPUTATION_DAO_ADDRESS, REPUTATION_DAO_ABI, REPUTATION_ORACLE_ADDRESS, REPUTATION_ORACLE_ABI } from '../constants';

const ProposalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const address = useAddress();
  const [isVoting, setIsVoting] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState('');
  
  // Get DAO contract
  const { contract: daoContract } = useContract(
    REPUTATION_DAO_ADDRESS,
    [
      {
        "inputs": [{
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }],
        "name": "getProposal",
        "outputs": [
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "yesVotes",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "noVotes",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "executed",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "proposalId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "voter",
            "type": "address"
          }
        ],
        "name": "hasVoted",
        "outputs": [{
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "proposalId",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "support",
            "type": "bool"
          }
        ],
        "name": "vote",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [{
          "internalType": "uint256",
          "name": "proposalId",
          "type": "uint256"
        }],
        "name": "executeProposal",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  );
  
  // Get proposal details
  const { data: proposalData, isLoading: proposalLoading, refetch: refetchProposal } = 
    useContractRead(daoContract, "getProposal", [id]);
  
  // Get user's vote status
  const { data: userVoteWeight, isLoading: voteLoading, refetch: refetchVote } = 
    useContractRead(daoContract, "hasVoted", [id, address || "0x0000000000000000000000000000000000000000"]);
  
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
  
  // Contract write functions
  const { mutateAsync: vote } = useContractWrite(daoContract, "vote");
  const { mutateAsync: executeProposal } = useContractWrite(daoContract, "executeProposal");
  
  // Format proposal data
  const proposal = proposalData ? {
    id: Number(id),
    description: proposalData[0],
    yesVotes: proposalData[1].toNumber(),
    noVotes: proposalData[2].toNumber(),
    deadline: new Date(proposalData[3].toNumber() * 1000),
    executed: proposalData[4]
  } : null;
  
  // Handle voting
  const handleVote = async (support) => {
    if (!address) {
      setError('Please connect your wallet');
      return;
    }
    
    if (reputationScore?.toNumber() === 0) {
      setError('You need a reputation score to vote');
      return;
    }
    
    setIsVoting(true);
    setError('');
    
    try {
      // Call the vote function on the contract
      const data = await vote({ args: [id, support] });
      console.log("Vote submitted:", data);
      
      // Refetch proposal and vote data
      await refetchProposal();
      await refetchVote();
    } catch (err) {
      console.error("Error voting:", err);
      setError(err.message || 'Failed to submit vote');
    } finally {
      setIsVoting(false);
    }
  };
  
  // Handle proposal execution
  const handleExecute = async () => {
    if (!address) {
      setError('Please connect your wallet');
      return;
    }
    
    setIsExecuting(true);
    setError('');
    
    try {
      // Call the executeProposal function on the contract
      const data = await executeProposal({ args: [id] });
      console.log("Proposal executed:", data);
      
      // Refetch proposal data
      await refetchProposal();
    } catch (err) {
      console.error("Error executing proposal:", err);
      setError(err.message || 'Failed to execute proposal');
    } finally {
      setIsExecuting(false);
    }
  };
  
  // Calculate proposal status
  const getProposalStatus = () => {
    if (!proposal) return {};
    
    const isActive = proposal.deadline > new Date() && !proposal.executed;
    
    if (isActive) {
      return { label: "Active", className: "status-active" };
    } else if (proposal.executed) {
      const passed = proposal.yesVotes > proposal.noVotes;
      return passed 
        ? { label: "Passed", className: "status-passed" }
        : { label: "Failed", className: "status-failed" };
    } else {
      return { label: "Pending Execution", className: "status-pending" };
    }
  };
  
  // Calculate vote percentage
  const calculateVotePercentage = () => {
    if (!proposal) return 0;
    
    const totalVotes = proposal.yesVotes + proposal.noVotes;
    if (totalVotes === 0) return 0;
    return Math.round((proposal.yesVotes / totalVotes) * 100);
  };
  
  // Check if user has already voted
  const hasVoted = userVoteWeight?.toNumber() > 0;
  
  // Check if proposal can be executed
  const canExecute = proposal && 
    !proposal.executed && 
    proposal.deadline <= new Date();
  
  // Get proposal status
  const status = getProposalStatus();
  
  return (
    <div>
      <button 
        className="btn btn-secondary" 
        onClick={() => navigate('/proposals')}
        style={{ marginBottom: '20px' }}
      >
        ← Back to Proposals
      </button>
      
      <h1>Proposal Details</h1>
      
      {!address ? (
        <div className="card">
          <p>Please connect your wallet to view proposal details.</p>
        </div>
      ) : proposalLoading || voteLoading || scoreLoading ? (
        <div className="spinner"></div>
      ) : !proposal ? (
        <div className="card">
          <p>Proposal not found.</p>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                Proposal #{proposal.id}
              </h2>
              <span className={`proposal-status ${status.className}`}>
                {status.label}
              </span>
            </div>
            
            <div className="card-body">
              <div className="proposal-description" style={{ marginBottom: '20px' }}>
                <h3>Description</h3>
                <p style={{ whiteSpace: 'pre-wrap' }}>{proposal.description}</p>
              </div>
              
              <div className="proposal-details">
                <div className="detail-item">
                  <strong>Created:</strong> {proposal.deadline.toLocaleDateString()}
                </div>
                <div className="detail-item">
                  <strong>Voting Deadline:</strong> {proposal.deadline.toLocaleDateString()} {proposal.deadline.toLocaleTimeString()}
                </div>
                <div className="detail-item">
                  <strong>Status:</strong> <span className={status.className}>{status.label}</span>
                </div>
              </div>
              
              <div className="proposal-votes" style={{ marginTop: '30px' }}>
                <h3>Votes</h3>
                <div className="vote-bar">
                  <div 
                    className="vote-progress" 
                    style={{ width: `${calculateVotePercentage()}%` }}
                  ></div>
                </div>
                
                <div className="vote-counts">
                  <span>Yes: {proposal.yesVotes}</span>
                  <span>{calculateVotePercentage()}%</span>
                  <span>No: {proposal.noVotes}</span>
                </div>
                
                {hasVoted && (
                  <div className="user-vote" style={{ marginTop: '10px', textAlign: 'center' }}>
                    <p>
                      You voted with a weight of {userVoteWeight.toNumber()}
                    </p>
                  </div>
                )}
              </div>
              
              {error && (
                <div className="error-message" style={{ color: 'var(--danger)', margin: '15px 0' }}>
                  {error}
                </div>
              )}
              
              <div className="proposal-actions" style={{ marginTop: '30px' }}>
                {proposal.deadline > new Date() && !proposal.executed && !hasVoted && reputationScore?.toNumber() > 0 ? (
                  <div className="vote-buttons">
                    <button 
                      className="btn btn-success" 
                      onClick={() => handleVote(true)}
                      disabled={isVoting}
                    >
                      {isVoting ? 'Voting...' : 'Vote Yes'}
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleVote(false)}
                      disabled={isVoting}
                    >
                      {isVoting ? 'Voting...' : 'Vote No'}
                    </button>
                  </div>
                ) : proposal.deadline <= new Date() && !proposal.executed ? (
                  <button 
                    className="btn btn-primary" 
                    onClick={handleExecute}
                    disabled={isExecuting}
                  >
                    {isExecuting ? 'Executing...' : 'Execute Proposal'}
                  </button>
                ) : null}
                
                {reputationScore?.toNumber() === 0 && proposal.deadline > new Date() && !hasVoted && (
                  <div style={{ marginTop: '15px', textAlign: 'center' }}>
                    <p>You need a reputation score to vote.</p>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => navigate('/reputation')}
                      style={{ marginTop: '10px' }}
                    >
                      Get Reputation Score
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProposalDetails;
