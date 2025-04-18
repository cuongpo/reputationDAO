#!/bin/bash

# Start the Reputation DAO application with deployed contracts

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Reputation DAO Application${NC}"
echo -e "${YELLOW}Using deployed contracts on Rootstock testnet${NC}"
echo -e "ReputationOracle: 0xABd3c4b7D19b4bb2fe8edfe0Cae9e8BCfefA558f"
echo -e "ReputationDAO: 0xc222001963d0F00B96C4DB6178Ef48f2F0DDe57C"

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
  echo -e "${YELLOW}Warning: .env file not found in backend directory. Creating from example...${NC}"
  cp backend/env-config.txt backend/.env
  echo -e "${YELLOW}Please update backend/.env with your actual OpenAI API key${NC}"
fi

# Start backend server in background
echo -e "${GREEN}Starting backend server...${NC}"
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to start...${NC}"
sleep 5

# Start frontend
echo -e "${GREEN}Starting frontend...${NC}"
npm start

# Cleanup when frontend is closed
kill $BACKEND_PID
echo -e "${GREEN}Application stopped${NC}"
