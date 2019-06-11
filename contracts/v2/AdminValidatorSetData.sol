pragma solidity ^0.5.1;
import "./Index.sol";
import "./MultiSigSecured.sol";
import "./SafeMath.sol";

contract AdminValidatorSetData is MultiSigSecured {
	
	uint32 public nodeCount;
	uint32 public active;
	Index  indexContract;
	uint256 THRESHOLD = 1000000000000;
	uint256 MIN_LOCKIN_TIME = 1555200; // number of blocks or 90 days aprox
	
	using SafeMath for uint32;
    using SafeMath for uint256;

	struct Delegates {
		bool    status;
		uint256 stake;
		address parentPool; // optional block number, lock in period
		uint256 startBlockNumber;
		uint256 lockInTime;
		uint32  renewed;
	}

	struct NodeDetails {
		bool status;
	}

	mapping ( address => NodeDetails ) private adminNodes;
	mapping ( address => Delegates ) private delegateAccounts; 

	constructor (address _indexAddress) public {
		indexContract = Index(_indexAddress);
	}

	function append ( string memory _method, string memory _contractName ) pure internal returns( string memory m ) {
		return string( abi.encodePacked( _method, _contractName ) );
	}

	function toString (address _address) public pure returns(string memory s){
		return string( abi.encodePacked(_address) );
	}

	function vote ( string memory _methodName, bool _decision, address _from ) internal returns( uint8 ) {
		// returns 0 if no decision
		// returns 1 if positive decision
		// returns 2 if negative decision
		if ( _decision )
			voteFor( _methodName, _from );
		else
			voteAgainst( _methodName, _from );

		uint32 minVotes = getAcceptThreshold(_methodName);
		uint32[2] memory votes = getVotes(_methodName);

		if ( votes[0] >= minVotes ) {
			clearBallot( _methodName );
			return 1;
		}
		if ( votes[1] + minVotes > active ){
			clearBallot( _methodName );
			return 2;
		}
		return 0;
	}

	function newMasterNodeProposal ( address _address, uint32 _minVotes ) public returns( bool ) {
		assert ( adminNodes[msg.sender].status );
		string memory _temp = append( "updateMasterNode-", toString(_address) );
		assert ( !isBallotActive( _temp ) );
		createBallot(
		    _temp,
		    _address,
		    true,
		    _minVotes,
		    msg.sender
		);
		return true;
	}

	function updateMasterNodeProposal ( address _address, bool _decision ) public returns ( bool ) {
		assert ( adminNodes[msg.sender].status );
		string memory _temp = append( "updateMasterNode-", toString(_address) );
		assert( isBallotActive ( _temp ) );
		uint8 res = vote ( _temp, _decision, msg.sender );
		if ( res == 0 )
			return true;
		else if ( res == 1 )
			adminNodes[msg.sender].status = true;
		else if ( res == 2 )
			adminNodes[msg.sender].status = false;
		return true;
	}

	function newDeletegateNode ( address _poolAddress, uint256 _lockIn ) public payable returns ( bool ) {
		// add delegate here with the amount of balance he deposits in msg.value
		assert ( adminNodes[_poolAddress].status );
		assert ( msg.value > THRESHOLD );
		assert ( _lockIn >= MIN_LOCKIN_TIME );
		delegateAccounts[msg.sender].status 		  = true;
		delegateAccounts[msg.sender].stake  		  = delegateAccounts[msg.sender].stake.add(msg.value);
		delegateAccounts[msg.sender].parentPool 	  = _poolAddress;
		delegateAccounts[msg.sender].lockInTime 	  = _lockIn;
		delegateAccounts[msg.sender].startBlockNumber = block.number;
		return true;
	}

	function withdraw ( uint256 _amount ) public returns ( bool ) {
		assert ( delegateAccounts[msg.sender].status );
		assert ( _amount <= delegateAccounts[msg.sender].stake );
		assert ( delegateAccounts[msg.sender].startBlockNumber + delegateAccounts[msg.sender].lockInTime > block.number );
		msg.sender.transfer( _amount );
		return true;
	}

	function renew (uint256 _lockIn) public returns ( bool ) {
		assert ( _lockIn > THRESHOLD );
		uint256 lockIn  = delegateAccounts[msg.sender].lockInTime;
		uint32  renewed = delegateAccounts[msg.sender].renewed;
		delegateAccounts[msg.sender].lockInTime = lockIn.add(_lockIn);
		delegateAccounts[msg.sender].renewed    = renewed.add32(1);
		return true;
	}

	function disableDelegate ( address _delegateAddress ) public returns(bool){
		assert ( delegateAccounts[_delegateAddress].stake == 0 );
		assert ( delegateAccounts[_delegateAddress].parentPool == msg.sender );
		delete delegateAccounts[_delegateAddress];
		return true;
	}

}