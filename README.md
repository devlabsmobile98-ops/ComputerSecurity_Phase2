# Part 1 – Smart Contract and Blockchain Setup

## Tools Used
- Ganache
- MetaMask
- Remix IDE
- Solidity

## Tasks Completed
1. Set up local Ethereum blockchain using Ganache.
2. Connected MetaMask to Ganache local network.
3. Created and compiled SecureVoting smart contract in Solidity.
4. Deployed contract through Remix using Injected Provider.
5. Registered voter successfully.
6. Submitted first vote successfully.
7. Verified double voting prevention by attempting a second vote, which was rejected.
8. Exported contract ABI and recorded deployed contract address for backend integration.

## Important Outputs
- **Contract Address:** .gitignore
- **Test Wallet Address:** .gitignore
- **ABI saved in:** `contracts/abi.json`

## Key Security Feature Implemented
- Double vote prevention using `mapping(address => Voter)` and `voted` boolean flag.

# Part 2 – Project Integration & Backend
## Tools Used
- Node.js
- Express.js
- Ethers.js
- Ganache (local blockchain)
- MetaMask
- Crypto (Node.js SHA-256 hashing)

## Task Completed
1. Set up a Node.js + Express backend server.
2. Connected backend to the Ethereum blockchain (Ganache) using Ethers.js.
3. Integrated backend with the deployed SecureVoting smart contract.
4. Implemented API endpoints for:
- Voter registration
- Vote submission
- Retrieving total votes
5. Implemented SHA-256 hashing for vote data before sending it to the blockchain.
6. Ensured backend correctly interacts with smart contract functions:
- registerVoter(address)
- vote(bytes32)
- totalVotes()
7. Successfully tested full flow:
- Register voter → Submit vote → Store hashed vote → Retrieve results

## API Endpoints
### 1. Register Voter
POST /register:
Registers the connected wallet address as a voter.

#### Response:
{
  "success": true,
  "message": "Voter registered"
}

### 2. Submit Vote
POST /vote
#### Request Body:
{
  "vote": "Alice"
}

#### Process:
- Vote is hashed using SHA-256
- Hashed vote is stored on blockchain

#### Response:
{
  "success": true,
  "vote": "Alice",
  "hash": "0x...",
  "txHash": "0x..."
}

### 3. Get Total Votes
GET /totalVotes

#### Response:
{
  "total": "1"
}

## Key Security Feature Implemented
Vote Hashing (SHA-256):
- Raw vote data is never stored directly on the blockchain.
- Each vote is hashed before submission, ensuring Data privacy and Integrity of vote records

## Backend Setup Instructions
1. Navigate to backend folder: cd backend
2. Install dependencies: npm install
3. Run server: node index.js
4. Server runs on: http://localhost:3000

## Integration Summary
- Backend successfully communicates with smart contract on Ganache.
- Smart contract enforces Voter registration and One vote per address (double-vote prevention)
- Backend handles Data processing, Hashing and API communication

## Result
The system runs end-to-end successfully, demonstrating:
- Blockchain interaction
- Secure vote handling
- Backend–smart contract integration

# Part 3 - Voting Interface
## Tools Used
- HTML
- CSS
- JavaScript (Vanilla)
- Fetch API
- Browser (Chrome)

## Tasks Completed
1. Designed a simple web-based voting interface using HTML and CSS.
2. Implemented frontend logic using JavaScript to communicate with backend APIs.
3. Connected frontend to backend using HTTP requests (Fetch API).
4. Created interactive UI components for:
    - Voter registration
    - Vote selection and submission
    - Viewing total votes
5. Displayed user-friendly messages instead of raw JSON responses.
6. Handled error cases such as:
    - Duplicate voting
    - Unregistered voter attempts
7. Successfully tested full frontend-to-backend interaction.

## Interface Features
1. Voter Registration
    - Users can register through the UI.
    - Send a POST request to /register.
Output Example:
Voter registered successfully ✅

2. Vote Submission
    - Users select a candidate (e.g., Alice, Bob, Charlie).
    - Sends vote to backend via /vote.
Output Example:
You voted for Alice ✅

3. Duplicate Vote Handling
    - If user attempts to vote again, system blocks the action.
Output Example:
Error: Already voted

4. View Total Votes
    - Retrieves vote count from blockchain.
Output Example:
Total votes: 1

## Frontend–Backend Interaction
The frontend communicates with the backend using the Fetch API:
- POST /register → Registers voter
- POST /vote → Submits vote
- GET /totalVotes → Retrieves vote count
All blockchain interactions are handled by the backend, while the frontend focuses on user interaction and display.

## User Experience Improvements
To improve usability and clarity:
- Replaced raw JSON responses with human-readable messages.
- Added success indicators (✅) for positive actions.
- Standardized error messages for clarity.
- Ensured consistent UI styling for inputs, buttons, and output display.

## Result
The voting interface successfully provides a user-friendly way to interact with the blockchain system. It demonstrates:
- Seamless frontend–backend communication
- Real-time feedback to user actions
- Clear and intuitive interaction flow
This completes the full system pipeline:
User Interface → Backend API → Smart Contract → Blockchain

# Part 4 - Security & System Testing
