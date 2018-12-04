pragma solidity 0.4.24;

contract Mortal {
    /* Define variable owner of the type address */
    address internal owner;

    /* This function is executed at initialization and sets the owner of the contract */
    constructor() public { owner = msg.sender; }

    /* Function to recover the funds on the contract */
    function kill() public { if (msg.sender == owner) selfdestruct(owner); }
}

contract Invoice is Mortal {

    enum Status {
		INACTIVE,
		PENDING,
		ACTIVE
	}

	struct InvoiceStruct {
		bool isExist;
        string invoiceID;
		Status status;
	}

    mapping (string => InvoiceStruct) invoices;

    /* Define variable greeting of the type string */
    // string private greeting;
    // uint32 private myNumber;

    /* This runs when the contract is executed */
    // constructor(string _greeting) public {
    //     greeting = _greeting;
    //     myNumber = 0;
    // }

    /* addInvoice function */
    function addInvoice(string invoiceID, string hash) public returns (bool) {
        invoices[hash].isExist = true;
        invoices[hash].invoiceID = invoiceID;
        invoices[hash].status = Status.ACTIVE;

        return true;
    }

    /* isHashExists function */
    function isHashExists(string hash) public view returns (bool) {
        if(invoices[hash].isExist)
            return true;
        else   
            return false;
    }

    /* getInvoiceID function */
    function getInvoiceID(string hash) public view returns (string) {
        if(!isHashExists(hash))
            return "";
        
        return invoices[hash].invoiceID;
    }

    /* getOwner function */
    function getOwner() public view returns (address) {
        return owner;
    }
}
