pragma solidity ^0.5.1;
import "./SafeMath.sol";


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
		uint32     votesFor;
		uint32     votesAgainst;
		uint32     minVotesRequired;
		bool       isActive;
		address[]  votedAddresses;
	}

	mapping ( string => Ballot ) private ballotMap;

	function voteFor(string memory _method, address _sender) internal returns(bool){
		assert(isBallotActive(_method));
		assert(!hasVoted(_method, _sender));
		uint32 votesFor = ballotMap[_method].votesFor.add32(1);
		ballotMap[_method].votesFor = votesFor;
		ballotMap[_method].votedAddresses.push(_sender);
		return true;
	}

	function voteAgainst(string memory _method, address _sender) internal returns(bool){
		assert(isBallotActive(_method));
		assert(!hasVoted(_method, _sender));
		uint32 votesAgainst = ballotMap[_method].votesAgainst.add32(1);
		ballotMap[_method].votesAgainst = votesAgainst;
		ballotMap[_method].votedAddresses.push(_sender);
		return true;
	}

	function createBallot(string memory _method, address _newAddress, bool _initialVote, uint32 _minVotes, address _sender) internal returns(bool){
		assert(!isBallotActive(_method));
		assert(!hasVoted(_method, _sender));
		uint32 votesFor     = 0;
		uint32 votesAgainst = 0;
		if(_initialVote)
			votesFor.add32(1);
		else
			votesAgainst.add32(1);
		address[] memory temp;
		ballotMap[_method] = Ballot({
			newAddress:_newAddress,
			votesFor:votesFor,
			votesAgainst:votesAgainst,
			minVotesRequired:_minVotes,
			isActive:true,
			votedAddresses:temp
		});
		ballotMap[_method].votedAddresses.push(_sender);
		return true;
	}

	function clearBallot(string memory _method) internal returns(bool){
		delete ballotMap[_method];
		return true;
	}

	function isBallotActive(string memory _method) public view returns(bool){
		return ballotMap[_method].isActive;
	}

	function getProposedAddress(string memory _method) view internal returns(address){
		return ballotMap[_method].newAddress;
	}

	function getVotes(string memory _method) public view returns(uint32[2] memory v){
		uint32[2] memory _votes;
		_votes[0] = ballotMap[_method].votesFor;
		_votes[1] = ballotMap[_method].votesAgainst;
		return _votes;
	}

	function getAcceptThreshold(string memory _method) public view returns(uint32 _minVotes){
		return ballotMap[_method].minVotesRequired;
	}

	function getVotedAddresses(string memory _method) public view returns(address[] memory _addresses){
		return ballotMap[_method].votedAddresses;
	}

	function hasVoted(string memory _method, address _sender) public view returns(bool _decision){
		for(uint i=0; i<ballotMap[_method].votedAddresses.length; i++){
			if( _sender == ballotMap[_method].votedAddresses[i] ){
				return true;
			}
		}
		return false;
	}
}
