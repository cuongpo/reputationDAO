#!/bin/bash

# Start development environment for Reputation DAO

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Reputation DAO Development Environment${NC}"
echo -e "${YELLOW}Make sure you have set up your .env files before running this script${NC}"

# Check if .env files exist
if [ ! -f ".env" ]; then
  echo -e "${YELLOW}Warning: .env file not found in root directory. Creating from example...${NC}"
  cp .env.example .env
  echo -e "${YELLOW}Please update .env with your actual values${NC}"
fi

if [ ! -f "backend/.env" ]; then
  echo -e "${YELLOW}Warning: .env file not found in backend directory. Creating from example...${NC}"
  cp backend/.env.example backend/.env
  echo -e "${YELLOW}Please update backend/.env with your actual values${NC}"
fi

# Start backend server in background
echo -e "${GREEN}Starting backend server...${NC}"
cd backend
npm install &> /dev/null
node server.js &
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
echo -e "${GREEN}Development environment stopped${NC}"
