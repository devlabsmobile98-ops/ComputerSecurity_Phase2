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
- **Contract Address:** .GITIGNORE 
- **Test Wallet Address:** .GITIGNORE  
- **ABI saved in:** `contracts/abi.json`

## Key Security Feature Implemented
- Double vote prevention using `mapping(address => Voter)` and `voted` boolean flag.

# Part 2 – Project Integration & Backend
# Part 3 - Voting Interface
# Part 4 - Security & System Testing
