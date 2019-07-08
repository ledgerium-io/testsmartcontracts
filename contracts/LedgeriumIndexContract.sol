pragma solidity ^0.5.1;
import "./math/SafeMath.sol";
import "./MultiSigSecured.sol";
import "./Pausable.sol";

/*
 * @title LedgeriumIndexContract 
 * @author Vivek <https://github.com/bvivek777>
 * The LedgeriumIndexContract Contract hold the details of the controller and the data contracts
 * and allows various contracts to function concurrently while referencing each other's
 * address and providing a mechanism to ensure secure transactions between contracts
 *
 */

contract LedgeriumIndexContract is MultiSigSecured, Pausable {
    
    using SafeMath for uint32;
    using SafeMath for uint256;

	struct Contract{
		address   currentAddress;
		uint32    version;
		address[] addressHistory;
		bool      status;
	}

	enum Status {
		INACTIVE, 
		PENDING, 
		ACTIVE
	}

	struct StakeHolder {
		bool isActive;
		Status status;
	}

	address[] private stakeHolders;
	mapping(address => StakeHolder) private activeStakeHolders;
	mapping(string  => Contract) private contractMapping;
	mapping(address => bool) private exists;
	uint32 private totalStakeHoldersCount;				//Total count of active Admin Validators
	uint32  public activeStakeHoldersCount;
	bool private isInit; 								//To check if initial owners are set or not already

	//List of events
	event UpdateContractAddress(address indexed proposer, string indexed _contractName, address indexed newAddress);
	event UpdateContractAddressRejected(address indexed proposer, string indexed _contractName);
	event AddStakeHolder(address indexed proposer, address indexed stakeHolder);
	event RemoveStakeHolder(address indexed proposer, address indexed stakeHolder);
	event GlobalPause(address indexed proposer);
	event UnPauseGlobal(address indexed proposer);
	event MinStakeHoldersNeeded(uint8 minNoOfStakeHolders);
	event RangeStakeHoldersNeeded(uint32 minNoOfStakeHolders, uint32 maxNoOfStakeHolders);
	event TotalNoOfStakeHolders(uint32 noOfStakeHolders);
	event InitStakeHolderAdded(address stakeHolderAddress);

	/**
    * @dev check whether msg.sender is one of the active admin
    */
	modifier isStakeHolder() {
		// make sure only activeAdmin can operate
        require(activeStakeHolders[msg.sender].isActive);
        _;
    }
	
	/**
    * @dev check whether isInit is set true or not
    */
	modifier isInitalised() {
		// make sure isInit flag is set before any logical execution on the contract
        if(isInit) {_;}
    }

	/**
    * @dev Ensure isInit is set before any logical execution on the contract
    */
	modifier ifNotInitalised() {
		// 
        if(!isInit) {_;}
    }
	
	/**
    * @dev Function to initiate contract with adding first admins. The pre-deployed contract will be the owner
    * @return A success flag
    */
	function init(address[] memory addresses) public {
        require (addresses.length <= 5);
        require (!isInit);
        uint32 len = uint32(addresses.length);
		for ( uint8 i = 0; i < len; i++ ){
		    exists[addresses[i]] = true;
		    activeStakeHolders[addresses[i]].isActive = true;
		    activeStakeHolders[addresses[i]].status = Status.ACTIVE;
		    stakeHolders.push(addresses[i]);
		    emit InitStakeHolderAdded(addresses[i]);
		}
		
		activeStakeHoldersCount = len;
		totalStakeHoldersCount  = len;
		emit TotalNoOfStakeHolders(len);
		isInit = true;  //Important flag!
	}

	/**
    * @dev Internal Function to just append the strings
	* @return returns the appended string
    */
	function toString(address _address) internal pure returns(string memory s) {
		return string(abi.encodePacked(_address));
	}

	/**
    * @dev Function to create proposal to upgrade the contract. It checks validity of msg.sender with isStakeHolder modifier
    * msg.sender address should be one of the active admin
	* @param _contractName string, name of the contract
	* @param _newAddress address, name of the contract
	* @param _minVotes uint32, name of the contract
	* @return Emits event RangeStakeHoldersNeeded() for sending the range 
    * @return A success flag
    */
	function createAddressUpdateProposal(string memory _contractName, address _newAddress, uint32 _minVotes) public isContractActive returns(bool res) {
		require(exists[msg.sender]);
		require(getMethodStatus("updateAddress"));
		string memory _temp = append("updateAddress-", _contractName);
		require(!isBallotActive(_temp));

		if(_minVotes > 1 && _minVotes < activeStakeHoldersCount) {
			emit RangeStakeHoldersNeeded(1, activeStakeHoldersCount);
			return false;
		}

		// assert(! contractMapping[_contractName].status);
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

	/**
    * @dev Function to vote FOR or AGAINST for a proposal to upgrade the contract. It checks validity of msg.sender with isStakeHolder modifier
    * msg.sender address should be one of the active admin
	* @param _contractName string, name of the contract
	* @param _decision bool, flag to vote FOR or AGAINST
	* @return Emits event UpdateContractAddress() once the contract address is updated 
	* @return Emits event UpdateContractAddressRejected() if the contract address is rejected due to more no of against votes 
    * @return A success flag
    */
	function voteContractAddress(string memory _contractName, bool _decision) public isContractActive returns(bool res) {
		require(exists[msg.sender]);
		require(getMethodStatus("updateAddress"));
		string memory _temp = append("updateAddress-", _contractName);
		//string memory message = append("Ballot should exist with ", _temp);
		require(isBallotActive(_temp));

		//string memory message1 = append("Contract update status should be true with ", _contractName);
		require(contractMapping[_contractName].status);

		if(_decision)
			voteFor(_temp, msg.sender);
		else
			voteAgainst(_temp, msg.sender);

		uint32 minVotes = getAcceptThreshold(_temp);
		uint32[2] memory votes = getVotes(_temp);

		if(votes[0] >= minVotes) {
			address oldAddress = contractMapping[_contractName].currentAddress;
			uint32  version    = contractMapping[_contractName].version.add32(1);
			contractMapping[_contractName].currentAddress = getProposedAddress(_temp);
			contractMapping[_contractName].version        = version;
			contractMapping[_contractName].addressHistory.push(oldAddress);
			contractMapping[_contractName].status = false;
			emit UpdateContractAddress(getProposerAddress(_contractName), _contractName, contractMapping[_contractName].currentAddress);
			clearBallot(_temp);
			return true;
		}
		if(votes[1] + minVotes > activeStakeHoldersCount) {
			emit UpdateContractAddressRejected(getProposerAddress(_temp), _contractName);
			clearBallot(_temp);
		}	
		return true;
	}

	/**
    * @dev Function to return list of all StakeHolders
	* @return returns the list
    */
	function createStakeHolderUpdate(address _stakeHolder, bool _decision) public isContractActive isInitalised returns(bool res) {
		require(exists[msg.sender]);
		require(getMethodStatus("updateStakeHolder"));
		string memory _temp = append("updateStakeHolder-", toString(_stakeHolder));
		/*string memory message = append("Ballot exists with ", _temp);
		require(!isBallotActive(_temp), message);*/

		// assert(_minVotes > 1);
		uint32 _minVotes =(activeStakeHoldersCount / 2) + 1;
		if(!_decision && activeStakeHoldersCount < 3)
			return false; 
		if(_decision && activeStakeHoldersCount > 21)
			return false;
		require(createBallot(
		    _temp, 
		    _stakeHolder, 
		    _decision, 
		    _minVotes, 
		    msg.sender
		));
		if(_decision) 
			emit AddStakeHolder(msg.sender, _stakeHolder);
		else if(!_decision)
			emit RemoveStakeHolder(msg.sender, _stakeHolder);
		return true;
	}

	/**
    * @dev Function to create proposal to upgrade the contract. It checks validity of msg.sender with isStakeHolder modifier
    * msg.sender address should be one of the active admin
	* @param _newStakeHolder address, concerned stakeholder address
	* @param _decision bool, flag to vote FOR or AGAINST
	* @return Emits event UpdateContractAddress() once the contract address is updated 
	* @return Emits event UpdateContractAddressRejected() if the contract address is rejected due to more no of against votes 
    * @return A success flag
    */
	function voteStakeHolder(address _newStakeHolder, bool _decision) public isContractActive isInitalised returns(bool res) {
		require(exists[msg.sender]);
		require(getMethodStatus("updateStakeHolder"));
		string memory _temp = append("updateStakeHolder-", toString(_newStakeHolder));
		/*	string memory message = append("Ballot should exist with ", _temp);
			require(isBallotActive(_temp), message);*/

		if(_decision)
			voteFor(_temp, msg.sender);
		else
			voteAgainst(_temp, msg.sender);

		uint32 minVotes = getAcceptThreshold(_temp);
		uint32[2] memory votes = getVotes(_temp);

		if(votes[0] >= minVotes) {
			if(!exists[getProposedAddress(_temp)]) {
				stakeHolders.push(getProposedAddress(_temp));
				exists[getProposedAddress(_temp)] = true;
				totalStakeHoldersCount = totalStakeHoldersCount.add32(1);
    		}		
    		activeStakeHolders[getProposedAddress(_temp)].isActive = true;
    		activeStakeHolders[getProposedAddress(_temp)].status = Status.ACTIVE;
			activeStakeHoldersCount = activeStakeHoldersCount.add32(1);
			require(clearBallot(_temp));
			return true;
		}
		if(votes[1] + minVotes > activeStakeHoldersCount) {
			activeStakeHolders[getProposedAddress(_temp)].isActive = false;
    		activeStakeHolders[getProposedAddress(_temp)].status = Status.INACTIVE;
			activeStakeHoldersCount = activeStakeHoldersCount.sub32(1);
			//emit RemoveAdmin(votes[_address].proposer, _address);
			exists[ getProposedAddress(_temp) ] = false;
			require(clearBallot(_temp));
		}
		return true;
	}

	/**
    * @dev Function to return list of all StakeHolders
	* @return returns the list
    */
	function createGlobalPauseProposal(uint32 _minVotes, bool _decision) public returns(bool) {
		require(exists[msg.sender]);
		require(!isBallotActive("stop"));

		require((_minVotes > 1));
		createBallot(
		    "stop", 
		    0x0000000000000000000000000000000000000000, 
		    _decision, 
		    _minVotes, 
		    msg.sender
		);
		return true;
	}

	/**
    * @dev Function to return list of all StakeHolders
	* @return returns the list
    */
	function votePauseProposal(bool _decision) public returns(bool) {
		require(exists[msg.sender]);
		string memory STOP = "stop";
		require(isBallotActive(STOP));
		if(_decision)
			voteFor(STOP, msg.sender);
		else
			voteAgainst(STOP, msg.sender);

		uint32 minVotes = getAcceptThreshold(STOP);
		uint32[2] memory votes = getVotes(STOP);

		if(votes[0] >= minVotes) {
			stopContract();
			emit GlobalPause(getProposerAddress("stop"));
			clearBallot(STOP);
			return true;
		}
		if(votes[1] + minVotes > activeStakeHoldersCount) {
			startContract();
			emit UnPauseGlobal(getProposerAddress("stop"));
			clearBallot(STOP);
		}
		return true;
	}

	/**
    * @dev Function to return list of all StakeHolders
	* @return returns the list
    */
	function getAddress(string memory _contractName) public view returns(address _contractAddress) {
		return contractMapping[_contractName].currentAddress;
	}

	/**
    * @dev Function to return list of all StakeHolders
	* @return returns the status
    */
	function pauseMethod(string memory _method) public isContractActive returns(bool) {
		require(exists[msg.sender]);
		return stopMethod(_method);
	}

	/**
    * @dev Function to return list of all StakeHolders
	* @return returns the status
    */
	function unpauseMethod(string memory _method) public isContractActive returns(bool) {
		require(exists[msg.sender]);
		return startMethod(_method);
	}

	/**
    * @dev Function to get total StakeHolders
	* @return returns the number
    */
	function getStakeHoldersCount() public view isStakeHolder returns(uint32) {
	    return totalStakeHoldersCount;
	}
	
	/**
    * @dev Function to get total active stakeHolders
	* @return returns the number
    */
	function getActiveStakeHoldersCount() public view isStakeHolder returns(uint32) {
	    return activeStakeHoldersCount;
	}

	/**
    * @dev Function to return list of all StakeHolders
	* @return returns the list
    */
	function getAllStakeHolders() public view returns(address[] memory) {
		return stakeHolders;
	}

	/**
    * @dev Function to return list of all active stakeHolders
	* @return returns the bool
    */
	function isActiveStakeHolder(address _address) public view returns(bool) {
		return activeStakeHolders[_address].isActive;
	}

	/**
    * @dev Function to return list of all existing StakeHolders
	* @return returns the bool
    */
	function isExistingStakeHolder(address _address) public view returns(bool) {
		return exists[_address];
	}

	/**
    * @dev Function to get who all have voted for current proposal. It checks validity of msg.sender with isStakeHolder modifier
	* @return returns the array of no of votes FOR and AGAINST
    */
	function getVoted(string memory _method) public view isStakeHolder returns(uint32[2] memory v) {
	    return getVotes(_method);
	}

	/**
    * @dev Function to get who all have voted for current proposal. It checks validity of msg.sender with isAdmin modifier
	* @return returns the array of no of votes FOR and AGAINST
    */
	// function getProposal(string memory votingString) public view returns(bool) {
	// 	return isBallotActive(votingString);
	// }

	/**
    * @dev Function to get original proposer for the current proposal. It checks validity of msg.sender with isAdmin modifier
	* @return returns the address
    */
	function getProposer(string memory _method) public view isStakeHolder returns(address) {
		return getProposerAddress(_method);
	}

	/**
    * @dev Function to get whether ballot is active for the method
	* @return returns the bool
    */
	function isVotingActive(string memory _method) public view returns(bool) {
		return isBallotActive(_method);
	}

	/**
	* @dev Function to get votes for a particular stakeholder, votesFor and votesAgainst
	* @return uint32[2]
	*/
	function checkStakeholderVotes(address _stakeHolder) public view returns(uint32[2] memory) {
		require(exists[msg.sender]);
		string memory _temp = append("updateStakeHolder-", toString(_stakeHolder));
		uint32[2] memory votes = getVotes(_temp);
		return votes;
	}
}
