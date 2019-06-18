pragma solidity ^0.5.1;
import "./SafeMath.sol";
import "./MultiSigSecured.sol";
import "./Stoppable.sol";

/*
 * @title Index 
 * @author Vivek <https://github.com/bvivek777>
 * The Index Contract hold the details of the controller and the data contracts
 * and allows various contracts to function concurrently while referencing each other's
 * address and providing a mechanism to ensure secure transactions between contracts
 *
 */

contract Index is MultiSigSecured,Stoppable {
    
    using SafeMath for uint32;
    using SafeMath for uint256;

	struct Contract{
		address   currentAddress;
		uint32    version;
		address[] addressHistory;
		bool      status;
	}

	mapping ( string  => Contract ) private contractMapping;
	mapping ( address => bool ) private stakeHolders;
	uint32  public totalStakeHolders;

	constructor () public {
        stakeHolders[0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c] = true;
        stakeHolders[0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C] = true;
        stakeHolders[0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB] = true;
        stakeHolders[0x583031D1113aD414F02576BD6afaBfb302140225] = true;
        stakeHolders[0xdD870fA1b7C4700F2BD7f44238821C26f7392148] = true;
        totalStakeHolders = 5;

	}

	function append (string memory _method, string memory _contractName) pure internal returns(string memory m){
		return string( abi.encodePacked( _method, _contractName ) );
	}

	function toString (address _address) internal pure returns(string memory s){
		return string( abi.encodePacked(_address) );
	}

	function createAddressUpdateProposal (string memory _contractName, address _newAddress, uint32 _minVotes) public isActive returns (bool res){
		assert ( stakeHolders[msg.sender] );
		string memory _temp = append( "updateAddress-", _contractName );
		assert ( getMethodStatus( "updateAddress" ) );
		assert ( ! isBallotActive( _temp ) );
		assert ( _minVotes > 1 && _minVotes < totalStakeHolders );
		// assert ( ! contractMapping[_contractName].status );
		createBallot(
			_temp,
			_newAddress,
			true,
			_minVotes,
			msg.sender
		);
		contractMapping[_contractName].status = true;
		return true;
	}

	function voteContractAddress (string memory _contractName, bool _decision) public isActive returns(bool res) {
		assert( stakeHolders[msg.sender] );
		assert ( getMethodStatus( "updateAddress" ) );
		string memory _temp = append( "updateAddress-", _contractName );
		assert( isBallotActive( _temp ) );
		assert( contractMapping[_contractName].status );

		if ( _decision )
			voteFor( _temp, msg.sender );
		else
			voteAgainst( _temp, msg.sender );

		uint32 minVotes = getAcceptThreshold(_temp);
		uint32[2] memory votes = getVotes(_temp);

		if ( votes[0] >= minVotes ) {
			address oldAddress = contractMapping[_contractName].currentAddress;
			uint32  version    = contractMapping[_contractName].version.add32(1);
			contractMapping[_contractName].currentAddress = getProposedAddress( _temp );
			contractMapping[_contractName].version        = version;
			contractMapping[_contractName].addressHistory.push(oldAddress);
			contractMapping[_contractName].status = false;
			clearBallot( _temp );
			return true;
		}
		if ( votes[1] + minVotes > totalStakeHolders )
			clearBallot( _temp );
		return true;
	}

	function createStakeholderUpdate (address _newStakeholder, bool _decision) public isActive returns (bool res){
		assert( stakeHolders[msg.sender] );
		assert ( getMethodStatus( "updateStakeholder" ) );
		string memory _temp = append( "updateStakeholder-", toString(_newStakeholder) );
		assert( ! isBallotActive(_temp) );
		// assert( _minVotes > 1 );
		uint32 _minVotes = ( totalStakeHolders / 2 ) + 1;
		if ( !_decision && totalStakeHolders <= 5 )
			return false; 
		if ( _decision && totalStakeHolders >= 21 )
			return false;
		createBallot(
		    _temp,
		    _newStakeholder,
		    _decision,
		    _minVotes,
		    msg.sender
		);
		return true;
	}

	function voteStakeholder (address _newStakeholder, bool _decision) public isActive returns (bool res){
		assert( stakeHolders[msg.sender] );
		assert ( getMethodStatus( "updateStakeholder" ) );
		string memory _temp = append( "updateStakeholder-", toString(_newStakeholder) );
		assert( isBallotActive(_temp) );
		if ( _decision )
			voteFor( _temp, msg.sender);
		else
			voteAgainst( _temp, msg.sender);

		uint32 minVotes = getAcceptThreshold(_temp);
		uint32[2] memory votes = getVotes(_temp);

		if ( votes[0] >= minVotes ) {
			stakeHolders[ getProposedAddress( _temp ) ] = true;
			clearBallot( _temp );
			return true;
		}
		if ( votes[1] + minVotes > totalStakeHolders ){
			stakeHolders[ getProposedAddress( _temp ) ] = false;
			clearBallot( _temp );
		}
		return true;
	}

	function createGlobalPauseProposal (uint32 _minVotes, bool _decision) public returns(bool) {
		assert( stakeHolders[msg.sender] );
		assert( !isBallotActive("stop") );
		assert( _minVotes > 1 );
		createBallot(
		    "stop",
		    0x0000000000000000000000000000000000000000,
		    _decision,
		    _minVotes,
		    msg.sender
		);
		return true;
	}

	function votePauseProposal (bool _decision) public returns (bool){
		assert( stakeHolders[msg.sender] );
		string memory STOP = "stop";
		assert( isBallotActive(STOP) );
		if ( _decision )
			voteFor ( STOP, msg.sender );
		else
			voteAgainst( STOP, msg.sender );

		uint32 minVotes = getAcceptThreshold(STOP);
		uint32[2] memory votes = getVotes(STOP);

		if ( votes[0] >= minVotes ) {
			stopContract();
			clearBallot( STOP );
			return true;
		}
		if ( votes[1] + minVotes > totalStakeHolders ){
			startContract();
			clearBallot( STOP );
		}
		return true;
	}

	function getAddress(string memory _contractName) public isActive view returns(address _contractAddress){
		assert ( getContractStatus() );
		return contractMapping[_contractName].currentAddress;
	}

	function pauseMethod( string memory _method ) public isActive returns ( bool ) {
		assert( stakeHolders[msg.sender] );
		return stopMethod( _method );
	}

	function unpauseMethod( string memory _method ) public isActive returns (bool) {
		assert (stakeHolders[msg.sender]);
		return startMethod( _method );
	}

	function isStakeholder (address _address) public isActive view returns(bool){
		return stakeHolders[_address];
	}

}
