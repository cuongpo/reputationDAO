// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ReputationOracle
 * @dev Stores reputation scores for wallet addresses
 */
contract ReputationOracle is AccessControl {
    // Mapping from address to reputation score (0-100)
    mapping(address => uint256) public reputation;
    
    // Events
    event ReputationUpdated(address indexed user, uint256 score);
    
    // Roles
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ORACLE_ROLE, msg.sender);
    }
    
    /**
     * @dev Store reputation score for a single user
     * @param user Address of the user
     * @param score Reputation score (0-100)
     */
    function storeReputation(address user, uint256 score) external onlyRole(ORACLE_ROLE) {
        require(score <= 100, "Score must be between 0-100");
        reputation[user] = score;
        emit ReputationUpdated(user, score);
    }
    
    /**
     * @dev Store reputation scores for multiple users in a single transaction
     * @param users Array of user addresses
     * @param scores Array of reputation scores
     */
    function batchStoreReputation(address[] calldata users, uint256[] calldata scores) 
        external 
        onlyRole(ORACLE_ROLE) 
    {
        require(users.length == scores.length, "Arrays must have same length");
        
        for (uint256 i = 0; i < users.length; i++) {
            require(scores[i] <= 100, "Score must be between 0-100");
            reputation[users[i]] = scores[i];
            emit ReputationUpdated(users[i], scores[i]);
        }
    }
    
    /**
     * @dev Get reputation score for a user
     * @param user Address of the user
     * @return Reputation score (0-100)
     */
    function getReputation(address user) public view returns (uint256) {
        return reputation[user];
    }
}
