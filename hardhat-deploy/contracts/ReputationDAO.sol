// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface IReputationOracle {
    function getReputation(address user) external view returns (uint256);
}

/**
 * @title ReputationDAO
 * @dev DAO with weighted voting based on reputation scores
 */
contract ReputationDAO is AccessControl {
    // Proposal structure
    struct Proposal {
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 deadline;
        bool executed;
        mapping(address => uint256) voters; // Maps voter to their weight (0 = not voted)
    }
    
    // State variables
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    IReputationOracle public reputationOracle;
    uint256 public votingPeriod = 3 days;
    uint256 public minimumReputationToPropose = 20; // Minimum reputation score to create proposals
    
    // Events
    event ProposalCreated(uint256 indexed proposalId, address indexed creator, string description, uint256 deadline);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId, uint256 yesVotes, uint256 noVotes, bool passed);
    
    // Roles
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    
    constructor(address _reputationOracle) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(EXECUTOR_ROLE, msg.sender);
        reputationOracle = IReputationOracle(_reputationOracle);
    }
    
    /**
     * @dev Create a new proposal
     * @param description Description of the proposal
     * @return proposalId ID of the created proposal
     */
    function createProposal(string calldata description) external returns (uint256) {
        uint256 reputation = reputationOracle.getReputation(msg.sender);
        require(reputation >= minimumReputationToPropose, "Insufficient reputation to create proposal");
        
        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        
        proposal.description = description;
        proposal.deadline = block.timestamp + votingPeriod;
        
        emit ProposalCreated(proposalId, msg.sender, description, proposal.deadline);
        
        return proposalId;
    }
    
    /**
     * @dev Vote on a proposal
     * @param proposalId ID of the proposal
     * @param support True for yes vote, false for no vote
     */
    function vote(uint256 proposalId, bool support) external {
        require(proposalId < proposalCount, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp < proposal.deadline, "Voting period ended");
        require(!proposal.executed, "Proposal already executed");
        require(proposal.voters[msg.sender] == 0, "Already voted");
        
        uint256 weight = reputationOracle.getReputation(msg.sender);
        require(weight > 0, "No reputation score");
        
        proposal.voters[msg.sender] = weight;
        
        if (support) {
            proposal.yesVotes += weight;
        } else {
            proposal.noVotes += weight;
        }
        
        emit Voted(proposalId, msg.sender, support, weight);
    }
    
    /**
     * @dev Execute a proposal after voting period ends
     * @param proposalId ID of the proposal
     */
    function executeProposal(uint256 proposalId) external onlyRole(EXECUTOR_ROLE) {
        require(proposalId < proposalCount, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp >= proposal.deadline, "Voting period not ended");
        require(!proposal.executed, "Proposal already executed");
        
        proposal.executed = true;
        
        bool passed = proposal.yesVotes > proposal.noVotes;
        
        emit ProposalExecuted(proposalId, proposal.yesVotes, proposal.noVotes, passed);
        
        // Note: In a real implementation, this would trigger on-chain actions based on the proposal
    }
    
    /**
     * @dev Get proposal details
     * @param proposalId ID of the proposal
     * @return description Description of the proposal
     * @return yesVotes Number of yes votes
     * @return noVotes Number of no votes
     * @return deadline Deadline for voting
     * @return executed Whether the proposal has been executed
     */
    function getProposal(uint256 proposalId) external view returns (
        string memory description,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 deadline,
        bool executed
    ) {
        require(proposalId < proposalCount, "Invalid proposal ID");
        
        Proposal storage proposal = proposals[proposalId];
        
        return (
            proposal.description,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.deadline,
            proposal.executed
        );
    }
    
    /**
     * @dev Check if a voter has voted on a proposal
     * @param proposalId ID of the proposal
     * @param voter Address of the voter
     * @return Weight of the vote (0 if not voted)
     */
    function hasVoted(uint256 proposalId, address voter) external view returns (uint256) {
        require(proposalId < proposalCount, "Invalid proposal ID");
        return proposals[proposalId].voters[voter];
    }
    
    /**
     * @dev Update the voting period
     * @param newVotingPeriod New voting period in seconds
     */
    function setVotingPeriod(uint256 newVotingPeriod) external onlyRole(DEFAULT_ADMIN_ROLE) {
        votingPeriod = newVotingPeriod;
    }
    
    /**
     * @dev Update the minimum reputation required to create proposals
     * @param newMinimum New minimum reputation score
     */
    function setMinimumReputationToPropose(uint256 newMinimum) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newMinimum <= 100, "Minimum must be between 0-100");
        minimumReputationToPropose = newMinimum;
    }
}
