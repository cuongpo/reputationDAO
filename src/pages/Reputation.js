import React, { useState, useEffect } from 'react';
import { useAddress, useContract, useContractRead } from "@thirdweb-dev/react";
import axios from 'axios';
import { REPUTATION_ORACLE_ADDRESS, REPUTATION_ORACLE_ABI, API_URL } from '../constants';

const Reputation = () => {
  const address = useAddress();
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Get contract and reputation score
  const { contract } = useContract(
    REPUTATION_ORACLE_ADDRESS,
    REPUTATION_ORACLE_ABI // Use the full ABI from constants.js
  );
  
  const { data: reputationScore, isLoading: scoreLoading, refetch: refetchScore } = 
    useContractRead(contract, "getReputation", [address || "0x0000000000000000000000000000000000000000"]);
  
  // Calculate reputation score
  const calculateScore = async () => {
    if (!address) return;
    
    setCalculating(true);
    setError(null);
    setResult(null); // Clear previous result
    
    try {
      // Call the backend API to calculate and store the score
      console.log(`Requesting score calculation for ${address}`);
      const response = await axios.post(`${API_URL}/score/${address}`);
      console.log('Score calculation response:', response.data);
      
      // Make sure all the metrics are included in the result
      const completeResult = {
        ...response.data,
        // Ensure these fields exist even if they're not in the API response
        txCount: response.data.txCount || 0,
        walletAge: response.data.walletAge || 0,
        contractInteractions: response.data.contractInteractions || 0,
        tokenDiversity: response.data.tokenDiversity || 0,
        tokenBalance: response.data.tokenBalance || 0,
        suspiciousActivity: response.data.suspiciousActivity || 'No'
      };
      
      setResult(completeResult);
      console.log('Complete result with metrics:', completeResult);
      
      // Show success message if we have a transaction hash
      if (response.data.transaction && response.data.transaction.transactionHash) {
        console.log('Score stored on-chain:', response.data.transaction.transactionHash);
        
        // Wait longer for Rootstock to process the transaction
        setTimeout(() => {
          console.log('Refreshing score from blockchain...');
          refetchScore();
        }, 5000); // Increased from 2000 to 5000 ms for Rootstock
      } else {
        // If no transaction hash, still try to refresh the score
        console.log('No transaction hash found, still refreshing score...');
        refetchScore();
      }
    } catch (err) {
      console.error("Error calculating score:", err);
      if (err.response?.status === 404) {
        setError("Wallet not found or has no on-chain activity");
      } else if (err.response?.status === 400) {
        setError(err.response.data?.error || "Invalid wallet address");
      } else if (err.response?.status === 500) {
        setError("Server error. The AI scoring service or blockchain connection may be unavailable.");
      } else if (err.message && err.message.includes("network")) {
        setError("Network error. Please ensure you are connected to Rootstock testnet.");
      } else if (err.message && err.message.includes("contract")) {
        setError("Contract interaction error. The smart contract may not be responding correctly.");
      } else {
        setError(err.response?.data?.error || "Failed to calculate reputation score");
      }
    } finally {
      setCalculating(false);
    }
  };
  
  // Load reputation data
  useEffect(() => {
    const fetchData = async () => {
      if (!address) return;
      
      setLoading(true);
      try {
        // First try to get the score from the contract
        if (reputationScore && reputationScore.toNumber() > 0) {
          console.log(`Found on-chain score: ${reputationScore.toNumber()}`);
          // If we have an on-chain score but no result data yet, try to get the details from the API
          if (!result) {
            try {
              const response = await axios.get(`${API_URL}/score/${address}`);
              if (response.data) {
                console.log('Got score details from API:', response.data);
                setResult(response.data);
              }
            } catch (apiErr) {
              console.log('Could not get score details from API, using on-chain score only');
              // If API fails, just use the on-chain score
              setResult({
                address: address,
                score: reputationScore.toNumber(),
                reason: 'Score retrieved from blockchain',
                timestamp: new Date().toISOString()
              });
            }
          }
        } else {
          // If no on-chain score, try the API
          console.log('No on-chain score, checking API...');
          const response = await axios.get(`${API_URL}/score/${address}`);
          if (response.data.score > 0) {
            console.log('Got score from API:', response.data);
            setResult(response.data);
            // Refresh the on-chain score as it might be out of sync
            refetchScore();
          }
        }
      } catch (err) {
        // No score yet is fine, don't set error
        if (err.response?.status !== 404) {
          console.error('Error fetching reputation data:', err);
          setError(err.response?.data?.error || "Failed to fetch reputation data");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [address, reputationScore, refetchScore]);
  
  // Render reputation score visualization
  const renderScoreVisualization = (score) => {
    let color;
    let label;
    
    if (score === 0) {
      color = '#6c757d'; // Gray color for zero score
      label = 'No Activity';
    } else if (score >= 80) {
      color = '#06d6a0';
      label = 'Excellent';
    } else if (score >= 60) {
      color = '#3a86ff';
      label = 'Good';
    } else if (score >= 40) {
      color = '#ffd166';
      label = 'Average';
    } else if (score >= 20) {
      color = '#f8961e';
      label = 'Fair';
    } else {
      color = '#ef476f';
      label = 'Poor';
    }
    
    return (
      <div className="score-visualization">
        <div className="score-circle" style={{ 
          background: `conic-gradient(${color} ${score}%, #e9ecef ${score}% 100%)` 
        }}>
          <div className="score-value">{score}</div>
        </div>
        <div className="score-label" style={{ color }}>{label}</div>
      </div>
    );
  };
  
  return (
    <div>
      <h1>Reputation Score</h1>
      
      {!address ? (
        <div className="card">
          <p>Please connect your wallet to view your reputation score.</p>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Your Reputation</h2>
              <button 
                className="btn btn-primary" 
                onClick={calculateScore} 
                disabled={calculating}
              >
                {calculating ? 'Calculating...' : 'Calculate Score'}
              </button>
            </div>
            
            <div className="card-body">
              {loading || scoreLoading ? (
                <div className="spinner"></div>
              ) : reputationScore !== undefined || (result && result.score !== undefined) ? (
                <div className="reputation-details">
                  {renderScoreVisualization(reputationScore?.toNumber() !== undefined ? reputationScore.toNumber() : (result?.score !== undefined ? result.score : 0))}
                  <div className="reputation-info">
                    <p className="reputation-address">
                      <strong>Wallet:</strong> {address.substring(0, 6)}...{address.substring(address.length - 4)}
                    </p>
                    <p className="reputation-reason">
                      <strong>Reason:</strong> {result?.reason || 'Score calculated based on on-chain activity'}
                    </p>
                    {result?.dataSource === 'fallback' && (
                      <p className="reputation-warning" style={{ color: '#f8961e', fontStyle: 'italic' }}>
                        <strong>Note:</strong> Using estimated data due to Blockscout API unavailability
                      </p>
                    )}
                    {result?.error && (
                      <p className="reputation-error" style={{ color: '#ef476f', fontStyle: 'italic' }}>
                        <strong>Warning:</strong> {result.error.includes('on-chain') ? 'Score calculated but not stored on-chain' : result.error}
                      </p>
                    )}
                    <p className="reputation-timestamp">
                      <strong>Last Updated:</strong> {result?.timestamp ? new Date(result.timestamp).toLocaleString() : new Date().toLocaleString()}
                    </p>
                    {result?.transaction?.transactionHash && (
                      <p className="reputation-tx-hash">
                        <strong>Transaction Hash:</strong> <a 
                          href={`https://rootstock.blockscout.com/tx/${result.transaction.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ wordBreak: 'break-all', color: '#2a9d8f', textDecoration: 'underline' }}
                        >
                          {result.transaction.transactionHash}
                        </a>
                      </p>
                    )}
                    {result?.reason && (
                      <div className="reputation-reason">
                        <strong>Analysis:</strong>
                        <p>{result.reason}</p>
                        <div className="metrics-summary" style={{ marginTop: '10px', fontSize: '0.9em', border: '1px solid #eee', padding: '10px', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                          <p><strong>Metrics:</strong></p>
                          <pre style={{ margin: '0', whiteSpace: 'pre-wrap', fontSize: '0.9em' }}>
{`- Tx count: ${result.txCount || 0}
- Wallet age: ${result.walletAge || 0} days
- Contract interactions: ${result.contractInteractions || 0}
- Token balance: ${result.tokenBalance ? Number(result.tokenBalance).toFixed(16) : 0} BTC
- Suspicious activity: ${result.suspiciousActivity || 'No'}`}
                          </pre>
                        </div>
                        {result.dataSource === 'simulated' && (
                          <p className="note" style={{ fontSize: '0.8em', fontStyle: 'italic', color: '#666' }}>
                            Note: Some data was simulated due to API limitations.
                          </p>
                        )}
                      </div>
                    )}
                    <div className="reputation-note">
                      {(reputationScore?.toNumber() === 0 || result?.score === 0) ? (
                        <p style={{ color: '#6c757d' }}>This wallet has no on-chain activity. No voting power in the DAO.</p>
                      ) : (
                        <>
                          <p>This score determines your voting power in the DAO.</p>
                          <p style={{ fontSize: '0.9em', marginTop: '5px' }}>
                            <strong>On-chain score:</strong> {reputationScore?.toNumber() !== undefined ? reputationScore.toNumber() : (result?.score || 'Stored')}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : error ? (
                <div className="error-message">
                  <p>{error}</p>
                  <button 
                    className="btn btn-primary" 
                    onClick={calculateScore}
                    disabled={calculating}
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="no-score">
                  <p>You don't have a reputation score yet.</p>
                  <p>Click "Calculate Score" to analyze your wallet and generate your reputation.</p>
                </div>
              )}
              
              {error && (
                <div className="error-message">
                  <p>{error}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">How Reputation Works</h2>
            </div>
            <div className="card-body">
              <p>Your reputation score is calculated based on your on-chain activity:</p>
              <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                <li><strong>Transaction history</strong> - Number and frequency of transactions</li>
                <li><strong>Wallet age</strong> - How long your wallet has been active</li>
                <li><strong>Contract interactions</strong> - Diversity of smart contracts used</li>
                <li><strong>Token balance</strong> - Amount of BTC in your wallet</li>
                <li><strong>Transaction patterns</strong> - Analysis of transaction behavior</li>
              </ul>
              <p style={{ marginTop: '15px' }}>
                The AI analyzes these factors to generate a score between 0-100.
                Higher scores give you more voting power in the DAO.
              </p>
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                <p><strong>Scoring Process:</strong></p>
                <ol style={{ marginLeft: '20px' }}>
                  <li>Data is fetched from the Rootstock blockchain via Blockscout API</li>
                  <li>OpenAI's GPT-4 analyzes the wallet activity</li>
                  <li>A reputation score is generated and stored on-chain with a transaction hash</li>
                  <li>The score becomes your voting power in the DAO</li>
                </ol>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reputation;
