// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SecureVoting {
    address public admin;
    bool public electionOpen;

    struct Voter {
        bool registered;
        bool voted;
        string region;
    }

    mapping(address => Voter) public voters;
    bytes32[] public votes;

    event VoterRegistered(address indexed voter, string region);
    event VoteSubmitted(address indexed voter, bytes32 voteHash);
    event ElectionOpened();
    event ElectionClosed();

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
        electionOpen = true;
        emit ElectionOpened();
    }

    function openElection() public onlyAdmin {
        electionOpen = true;
        emit ElectionOpened();
    }

    function closeElection() public onlyAdmin {
        electionOpen = false;
        emit ElectionClosed();
    }

    function registerVoter(address _voter, string memory _region) public onlyAdmin {
        require(_voter != address(0), "Invalid voter address");
        require(bytes(_region).length > 0, "Region is required");
        require(!voters[_voter].registered, "Voter already registered");

        voters[_voter] = Voter({
            registered: true,
            voted: false,
            region: _region
        });

        emit VoterRegistered(_voter, _region);
    }

    function vote(bytes32 voteHash) public {
        require(electionOpen, "Election is closed");
        require(voters[msg.sender].registered, "Not registered");
        require(!voters[msg.sender].voted, "Already voted");

        voters[msg.sender].voted = true;
        votes.push(voteHash);

        emit VoteSubmitted(msg.sender, voteHash);
    }

    function totalVotes() public view returns (uint256) {
        return votes.length;
    }

    function isRegistered(address _voter) public view returns (bool) {
        return voters[_voter].registered;
    }

    function hasVoted(address _voter) public view returns (bool) {
        return voters[_voter].voted;
    }

    function getRegion(address _voter) public view returns (string memory) {
        return voters[_voter].region;
    }
}