// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SecureVoting {
    struct Voter {
        bool registered;
        bool voted;
    }

    mapping(address => Voter) public voters;
    bytes32[] public votes;

    event VoterRegistered(address voter);
    event VoteSubmitted(address voter, bytes32 voteHash);

    function registerVoter(address _voter) public {
        require(!voters[_voter].registered, "Voter already registered");
        voters[_voter] = Voter(true, false);
        emit VoterRegistered(_voter);
    }

    function vote(bytes32 voteHash) public {
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
}