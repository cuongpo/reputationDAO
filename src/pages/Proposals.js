import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAddress, useContract, useContractRead } from "@thirdweb-dev/react";
import { REPUTATION_DAO_ADDRESS, REPUTATION_DAO_ABI } from '../constants';

const Proposals = () => {
  const address = useAddress();
  const [proposals, setProposals] = useState([]);
  
  // Get contract and proposal count
  const { contract } = useContract(REPUTATION_DAO_ADDRESS, REPUTATION_DAO_ABI);
  const { data: proposalCount, isLoading: countLoading } = 
    useContractRead(contract, "proposalCount");
  
  // Load all proposals
  useEffect(() => {
    const loadProposals = async () => {
      if (!contract || !proposalCount) return;
      
      const count = proposalCount.toNumber();
      const proposalPromises = [];
      
      for (let i = 0; i < count; i++) {
        proposalPromises.push(contract.call("getProposal", [i]));
      }
      
      try {
        const results = await Promise.all(proposalPromises);
        
        const formattedProposals = results.map((result, index) => {
          const [description, yesVotes, noVotes, deadline, executed] = result;
          const deadlineDate = new Date(deadline.toNumber() * 1000);
          const isActive = deadlineDate > new Date() && !executed;
          
          return {
            id: index,
            description,
            yesVotes: yesVotes.toNumber(),
            noVotes: noVotes.toNumber(),
            deadline: deadlineDate,
            executed,
            isActive
          };
        });
        
        setProposals(formattedProposals);
      } catch (error) {
        console.error("Error loading proposals:", error);
      }
    };
    
    loadProposals();
  }, [contract, proposalCount]);
  
  // Calculate proposal status
  const getProposalStatus = (proposal) => {
    if (proposal.isActive) {
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
  const calculateVotePercentage = (proposal) => {
    const totalVotes = proposal.yesVotes + proposal.noVotes;
    if (totalVotes === 0) return 0;
    return Math.round((proposal.yesVotes / totalVotes) * 100);
  };
  
  return (
    <div>
      <div className="proposals-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>DAO Proposals</h1>
        {address && (
          <Link to="/proposals/create" className="btn btn-primary">
            Create Proposal
          </Link>
        )}
      </div>
      
      {!address ? (
        <div className="card">
          <p>Please connect your wallet to view and interact with proposals.</p>
        </div>
      ) : countLoading ? (
        <div className="spinner"></div>
      ) : proposals.length === 0 ? (
        <div className="card">
          <p>No proposals have been created yet.</p>
          <Link to="/proposals/create" className="btn btn-primary" style={{ marginTop: '15px' }}>
            Create the First Proposal
          </Link>
        </div>
      ) : (
        <div className="proposals-list">
          {proposals.map((proposal) => {
            const status = getProposalStatus(proposal);
            const votePercentage = calculateVotePercentage(proposal);
            
            return (
              <div className="card proposal-card" key={proposal.id}>
                <div className="card-header">
                  <h3 className="card-title" style={{ fontSize: '1.3rem' }}>
                    {proposal.description.length > 50 
                      ? `${proposal.description.substring(0, 50)}...` 
                      : proposal.description}
                  </h3>
                  <span className={`proposal-status ${status.className}`}>
                    {status.label}
                  </span>
                </div>
                
                <div className="proposal-votes">
                  <div className="vote-bar">
                    <div 
                      className="vote-progress" 
                      style={{ width: `${votePercentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="vote-counts">
                    <span>Yes: {proposal.yesVotes}</span>
                    <span>{votePercentage}%</span>
                    <span>No: {proposal.noVotes}</span>
                  </div>
                </div>
                
                <div style={{ marginTop: '15px' }}>
                  <p>
                    <strong>Deadline:</strong> {proposal.deadline.toLocaleDateString()} {proposal.deadline.toLocaleTimeString()}
                  </p>
                </div>
                
                <div style={{ marginTop: 'auto', textAlign: 'right', paddingTop: '15px' }}>
                  <Link to={`/proposals/${proposal.id}`} className="btn btn-primary">
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Proposals;
