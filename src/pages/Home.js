import React from 'react';
import { Link } from 'react-router-dom';
import { useAddress } from "@thirdweb-dev/react";

const Home = () => {
  const address = useAddress();

  return (
    <div>
      <section className="hero">
        <h1>🧠 AI-Powered Reputation Oracle + DAO</h1>
        <p>
          A decentralized reputation system on Rootstock that uses AI to evaluate wallet behavior
          and assigns trust scores that power weighted voting in our DAO.
        </p>
        <p className="subtitle">
          Connecting on-chain reputation with governance power for a more trusted ecosystem
        </p>
        
        {address ? (
          <div className="cta-buttons">
            <Link to="/reputation" className="btn btn-primary">Check Your Reputation</Link>
            <Link to="/proposals" className="btn btn-success" style={{ marginLeft: '10px' }}>View Proposals</Link>
          </div>
        ) : (
          <p>Connect your wallet to get started</p>
        )}
      </section>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">How It Works</h2>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div className="feature-item">
              <h3>1. Reputation Scoring</h3>
              <p>
                Our AI analyzes your on-chain activity from Rootstock blockchain data
                and assigns a reputation score based on your wallet's behavior.
              </p>
              <ul style={{ marginTop: '10px', fontSize: '0.9em' }}>
                <li>Transaction history analysis</li>
                <li>Wallet age consideration</li>
                <li>Smart contract interaction patterns</li>
                <li>Token diversity evaluation</li>
              </ul>
            </div>
            
            <div className="feature-item">
              <h3>2. On-Chain Storage</h3>
              <p>
                Your reputation score is stored on the Rootstock blockchain,
                making it transparent, verifiable, and accessible to dApps.
              </p>
              <ul style={{ marginTop: '10px', fontSize: '0.9em' }}>
                <li>Immutable score records</li>
                <li>Transparent scoring history</li>
                <li>Interoperable with other dApps</li>
                <li>Secured by Rootstock's merge-mined security</li>
              </ul>
            </div>
            
            <div className="feature-item">
              <h3>3. Weighted Voting</h3>
              <p>
                Participate in DAO governance with voting power weighted by your
                reputation score, ensuring those with higher reputation have more influence.
              </p>
              <ul style={{ marginTop: '10px', fontSize: '0.9em' }}>
                <li>Sybil-resistant governance</li>
                <li>Merit-based voting power</li>
                <li>Incentivized positive behavior</li>
                <li>Community-driven decision making</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Built On</h2>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
            <div className="tech-badge">
              <span>Rootstock</span>
            </div>
            <div className="tech-badge">
              <span>OpenAI</span>
            </div>
            <div className="tech-badge">
              <span>Solidity</span>
            </div>
            <div className="tech-badge">
              <span>Thirdweb</span>
            </div>
            <div className="tech-badge">
              <span>React</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Why Reputation Matters</h2>
        </div>
        <div className="card-body">
          <p>
            In decentralized ecosystems, reputation is a critical component for building trust and enabling effective governance.
            Our system addresses several key challenges:
          </p>
          
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div className="benefit-item" style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4>🛡️ Sybil Resistance</h4>
              <p>Prevents attackers from creating multiple wallets to gain disproportionate influence in the DAO</p>
            </div>
            
            <div className="benefit-item" style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4>⚖️ Meritocratic Governance</h4>
              <p>Gives more voting power to members with proven positive on-chain history</p>
            </div>
            
            <div className="benefit-item" style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h4>🔄 Positive Feedback Loop</h4>
              <p>Incentivizes positive behavior by rewarding it with increased governance influence</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
