pragma solidity 0.4.24;

contract Mortal {
    /* Define variable owner of the type address */
    address internal owner;

    /* This function is executed at initialization and sets the owner of the contract */
    constructor() public { owner = msg.sender; }

    /* Function to recover the funds on the contract */
    function kill() public { if (msg.sender == owner) selfdestruct(owner); }
}

contract Greeter is Mortal {
    /* Define variable greeting of the type string */
    string private greeting;
    uint32 private myNumber;

    /* This runs when the contract is executed */
    constructor(string _greeting) public {
        greeting = _greeting;
        myNumber = 0;
    }

    /* greet function */
    function greet() public view returns (string) {
        return greeting;
    }

    /* getOwner function */
    function getOwner() public view returns (address) {
        return owner;
    }

    /* setMyNumber function */
    function setMyNumber(uint32 value) public {
        myNumber = value;
    }

    /* getMyNumber function */
    function getMyNumber() public view returns (uint32) {
        return myNumber;
    }
}
