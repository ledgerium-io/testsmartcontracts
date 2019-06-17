pragma solidity ^0.5.1;
import "./SafeMath.sol";

/*
 * @title Stoppable 
 * @author Vivek <https://github.com/bvivek777>
 * The Stoppable interface allows an easy mechanism to pause the functionality of a contract once a bug is discovered
 * It's just an extra safety mechanism to pull the plug if something goes wrong
 *
 */

contract Stoppable {

	mapping ( string => bool ) private methodList;
	bool public contractState;

	modifier isActive() {
		assert(contractState);
		_;
	}
	
	constructor ( ) public {
        methodList["updateAddress"] = true;
        methodList["updateStakeholder"] = true;
        contractState = true;
    }

	function startContract () internal returns(bool){
		contractState = true;
		return true;
	}

	function stopContract () internal returns(bool){
		contractState = false;
		return true;
	}

	function stopMethod ( string memory _methodName ) internal returns(bool){
		assert ( contractState );
		methodList[_methodName] = false;
		return true;
	}

	function startMethod ( string memory _methodName ) internal returns(bool){
		assert ( contractState );
		methodList[_methodName] = true;
		return true;
	}

	function getMethodStatus ( string memory _methodName ) public view returns(bool){
		return methodList[_methodName];
	}

	function getContractStatus () public view returns(bool){
		return contractState;
	}

}
