pragma solidity ^0.5.1;
import "./math/SafeMath.sol";


/*
 * @author Vivek <https://github.com/bvivek77>
 * @title MultiSigSecured
 * The MultiSigSecured contract allows other contracts to extend it and make 
 * methods internal to any contract secured with multi sig functionality
 */

contract MultiSigSecured {

	using SafeMath for uint32;

	struct Ballot {
		address    newAddress;
		address    proposer;	//Address which started the ballot
		uint32     votesFor;
		uint32     votesAgainst;
		uint32     minVotesRequired;
		bool       isBallotActive;
		address[]  votedAddresses;
	}

	mapping (string => Ballot) private ballotMap;

	/**
    * @dev Function to return list of all StakeHolders
	* @return returns the list
    */
	function append(string memory _method, string memory _contractName) pure internal returns(string memory m) {
		return string(abi.encodePacked(_method, _contractName));
	}

	function voteFor(string memory _method, address _sender) internal returns(bool) {
		require(isBallotActive(_method));
		require(!hasVoted(_method, _sender));
		uint32 votesFor = ballotMap[_method].votesFor.add32(1);
		ballotMap[_method].votesFor = votesFor;
		ballotMap[_method].votedAddresses.push(_sender);
		return true;
	}

	function voteAgainst(string memory _method, address _sender) internal returns(bool) {
		require(isBallotActive(_method));
		require(!hasVoted(_method, _sender));
		uint32 votesAgainst = ballotMap[_method].votesAgainst.add32(1);
		ballotMap[_method].votesAgainst = votesAgainst;
		ballotMap[_method].votedAddresses.push(_sender);
		return true;
	}

	function createBallot(string memory _method, address _newAddress, bool _initialVote, uint32 _minVotes, address _sender) internal returns(bool) {
		require(!isBallotActive(_method));
		require(!hasVoted(_method, _sender));
		uint32 votesFor     = 0;
		uint32 votesAgainst = 0;
		if (_initialVote)
			votesFor = votesFor.add32(1);
		else
			votesAgainst = votesAgainst.add32(1);
		address[] memory temp;
		ballotMap[_method] = Ballot({
			newAddress:_newAddress, 
			proposer:_sender, 		//msg.sender
			votesFor:votesFor, 
			votesAgainst:votesAgainst, 
			minVotesRequired:_minVotes, 
			isBallotActive:true, 
			votedAddresses:temp
		});
		ballotMap[_method].votedAddresses.push(_sender);
		return true;
	}

	function clearBallot(string memory _method) internal returns(bool) {
		//ballotMap[_method].proposer = address(0);
		delete ballotMap[_method];
		return true;
	}

	function isBallotActive(string memory _method) internal view returns(bool) {
		return ballotMap[_method].isBallotActive;
	}

	function getProposedAddress(string memory _method) view internal returns(address) {
		return ballotMap[_method].newAddress;
	}

	function getProposerAddress(string memory _method) view internal returns(address) {
		return ballotMap[_method].proposer;
	}

	function getVotes(string memory _method) internal view returns(uint32[2] memory v) {
		uint32[2] memory _votes;
		_votes[0] = ballotMap[_method].votesFor;
		_votes[1] = ballotMap[_method].votesAgainst;
		return _votes;
	}

	function getAcceptThreshold(string memory _method) internal view returns(uint32 _minVotes) {
		return ballotMap[_method].minVotesRequired;
	}

	function getVotedAddresses(string memory _method) internal view returns(address[] memory _addresses) {
		return ballotMap[_method].votedAddresses;
	}

	function hasVoted(string memory _method, address _sender) public view returns(bool _decision) {
		for(uint i=0; i<ballotMap[_method].votedAddresses.length; i++) {
			if (_sender == ballotMap[_method].votedAddresses[i]) {
				return true;
			}
		}
		return false;
	}
}
