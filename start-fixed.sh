#!/bin/bash

# Start the Reputation DAO application with fixed configuration

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Reputation DAO Application${NC}"
echo -e "${YELLOW}Using deployed contracts on Rootstock testnet${NC}"
echo -e "ReputationOracle: 0xABd3c4b7D19b4bb2fe8edfe0Cae9e8BCfefA558f"
echo -e "ReputationDAO: 0xc222001963d0F00B96C4DB6178Ef48f2F0DDe57C"

# Check if OpenAI API key is set
if grep -q "your_openai_api_key_here" "backend/.env"; then
  echo -e "${YELLOW}Warning: OpenAI API key not set in backend/.env${NC}"
  echo -e "${YELLOW}Please update backend/.env with your actual OpenAI API key${NC}"
  read -p "Do you want to continue without setting the API key? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Exiting..."
    exit 1
  fi
fi

# Check if Thirdweb Client ID is set
if grep -q "your_thirdweb_client_id_here" ".env"; then
  echo -e "${YELLOW}Warning: Thirdweb Client ID not set in .env${NC}"
  echo -e "${YELLOW}Please update .env with your actual Thirdweb Client ID${NC}"
  read -p "Do you want to continue without setting the Client ID? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Exiting..."
    exit 1
  fi
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing frontend dependencies...${NC}"
  npm install
fi

if [ ! -d "backend/node_modules" ]; then
  echo -e "${YELLOW}Installing backend dependencies...${NC}"
  cd backend
  npm install
  cd ..
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
