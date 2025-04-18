const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get contract addresses from environment variables
const reputationOracleAddress = process.env.REPUTATION_ORACLE_ADDRESS;
const reputationDaoAddress = process.env.REPUTATION_DAO_ADDRESS;

// Validate addresses
if (!reputationOracleAddress || reputationOracleAddress === '0x0000000000000000000000000000000000000000') {
  console.error('Error: REPUTATION_ORACLE_ADDRESS not set or is zero address');
  process.exit(1);
}

if (!reputationDaoAddress || reputationDaoAddress === '0x0000000000000000000000000000000000000000') {
  console.error('Error: REPUTATION_DAO_ADDRESS not set or is zero address');
  process.exit(1);
}

// Path to constants.js file
const constantsPath = path.join(__dirname, '../src/constants.js');

// Read the current file
let constantsFile = fs.readFileSync(constantsPath, 'utf8');

// Replace the contract addresses
constantsFile = constantsFile.replace(
  /export const REPUTATION_ORACLE_ADDRESS = "0x[a-fA-F0-9]{40}";/,
  `export const REPUTATION_ORACLE_ADDRESS = "${reputationOracleAddress}";`
);

constantsFile = constantsFile.replace(
  /export const REPUTATION_DAO_ADDRESS = "0x[a-fA-F0-9]{40}";/,
  `export const REPUTATION_DAO_ADDRESS = "${reputationDaoAddress}";`
);

// Write the updated file
fs.writeFileSync(constantsPath, constantsFile);

console.log('Contract addresses updated in constants.js:');
console.log(`REPUTATION_ORACLE_ADDRESS: ${reputationOracleAddress}`);
console.log(`REPUTATION_DAO_ADDRESS: ${reputationDaoAddress}`);
