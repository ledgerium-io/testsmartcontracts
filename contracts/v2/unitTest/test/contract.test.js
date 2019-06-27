const assert   = require('assert');
const Web3     = require('web3');
const quorumjs = require('quorum-js');
const fs       = require('fs');
const EthereumTx = require('ethereumjs-tx');
const ethUtil    = require('ethereumjs-util');

const bytecode = "0x"+fs.readFileSync('../compiled/Index.bin');
const abi      = JSON.parse( fs.readFileSync('../compiled/Index.abi'));

//console.log(abi);
const httpProvider     = 'http://138.197.193.201:8545';
const constellationUrl = 'http://138.197.193.201:10100';

const web3 = new Web3( new Web3.providers.HttpProvider(httpProvider) );
const enclaveOptions = {
	ipcPath: null,
	publicUrl: httpProvider,
	privateUrl: constellationUrl
};
var contractAddress = "0x99f1c1404Ff9A3E1DAa3C455798c870c8951C169";
const positive = "positive", negative = "negative";
const tempAddress = "0xca35b7d915458ef540ade6068dfe2f44e8fa733c";

const pk = [
	"f453a65736d84f0da1c4c725ca8918af1bf4a1f76f48da59899f3cc5d3cdc610",
	"67e0376bc9566b1f769ce1e5b9a95e101278958e62e81aae4cc0489914a7b5c7",
	"b215b7580e0ceec6dac6a80923de3474ec47153df96010eca11eddbd3fcdfb12",
	"a18b027102396e6ba57e341c869b8d7a395cacf529339a9fc4b38e122783401a"
];
const accountAddresses = [
	"0x2fc6991e16308104cf15130ea92a87066bc4dfb1",
	"0xc3431d5aff62832e0e56234f327b92cf4875fba5",
	"0xb701b51e22b66d6dcab7b748c5cec32bf52d5535",
	"0x56ea4b5a3a88484176d30616b5224a0ad3184da5"
];

const getReceipt = (hash, callback, receipt) => {
	if (!receipt) {
		web3.eth.getTransactionReceipt(hash, (err, receipt)=>{
			if (err) {
				callback( err, null );
				return;
			}
			if ( !receipt ) {
				setTimeout( getReceipt, 500, hash, callback, false );
			} else {
				callback( null, receipt );
			}
		})
	}
}

const sendTransaction = (acc, methodData, to, callback)=>{
	const from = '0x' + ethUtil.privateToAddress("0x" + pk[acc]).toString('hex');
	web3.eth.getTransactionCount( from, 'pending', (err, nonce)=>{
		if (err) {
			callback( err, null );
			return;
		}
		const tx = new EthereumTx({
			from  	 : from,
			to    	 : to,
			nonce 	 : nonce,
			gasPrice : web3.utils.toHex("1000000000"),
			gasLimit : web3.utils.toHex("4700000"),
			data     : methodData
		});
		const privateKeyBuffer = new Buffer( pk[acc], 'hex' );
		tx.sign( privateKeyBuffer );
		const serializedTx = tx.serialize();
		web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), ( err, hash )=>{
			if (err) {
				callback( err, null );
				return;
			}
			getReceipt( hash, callback );
		})
		.catch(callback);
	});
}


describe("Index Contract",()=>{ 

	before((done)=>{
		let c = new web3.eth.Contract(abi);
		const methodData = c.deploy({
			data: bytecode,
			arguments: []
		}).encodeABI();
		sendTransaction( 0, methodData, null, ( err, res ) => {
			if ( err ) {
				console.log( err );
			} else {
				console.log(res.contractAddress);
				contractAddress = res.contractAddress;
			}
			done();
		});
	});

	describe("createAddressUpdateProposal",()=>{
		it("PTC1 - create a proposal for Contract 1",(done)=>{
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.createAddressUpdateProposal(positive,accountAddresses[2],3).encodeABI();
			sendTransaction( 0, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					assert.equal( true, false );
				} else {
					assert.equal( res.status, true);
				}
				done();
			});
		});
		it("PTC2 - create a proposal for Contract 2",(done)=>{
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.createAddressUpdateProposal(negative,accountAddresses[2],3).encodeABI();
			sendTransaction( 0, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					assert.equal( true, false );
				} else {
					assert.equal( res.status, true);
				}
				done();
			});
		});
		it("NTC1 - check if proposal for Contract 1 can be created again", (done) => {
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.createAddressUpdateProposal(positive,accountAddresses[2],3).encodeABI();
			sendTransaction( 1, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					done( null, true);
				} else if ( res && !res.status ) {
					done( null, true);
				} else {
					done( new Error("Should Not Go Through"), null);
				}
			});
		})
	});

	describe("voteContractAddress", () => {
		it("PTC1 - 2nd positive vote for Contract 1",(done)=>{
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.voteContractAddress(positive, true).encodeABI();
			sendTransaction( 1, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					assert.equal( true, false );
				} else {
					assert.equal( res.status, true);
				}
				done();
			});
		});
		it("PTC2 - first negative vote for Contract 1",(done)=>{
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.voteContractAddress(positive, false).encodeABI();
			sendTransaction( 2, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					assert.equal( true, false );
				} else {
					assert.equal( res.status, true);
				}
				done();
			});
		});
		it("PTC3 - first negative vote for Contract 2",(done)=>{
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.voteContractAddress(negative, false).encodeABI();
			sendTransaction( 1, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					assert.equal( true, false );
				} else {
					assert.equal( res.status, true);
				}
				done();
			});
		});
		it("NTC1 - re-vote attempt for Contract 1",(done)=>{
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.voteContractAddress(positive, true).encodeABI();
			sendTransaction( 1, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					done( null, true);
				} else if ( res && !res.status ) {
					done( null, true);
				} else {
					done( new Error("Should Not Go Through"), null);
				}
			});
		});
		it("NTC2 - vote a contract without proposal",(done)=>{
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.voteContractAddress("doesnotexist", true).encodeABI();
			sendTransaction( 1, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					done( null, true);
				} else if ( res && !res.status ) {
					done( null, true);
				} else {
					done( new Error("Should Not Go Through"), null);
				}
			});
		});
	});

	describe("Vote Result Test", () => {
		it("PTC1 - second negative vote for Contract 1",(done)=>{
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.voteContractAddress(positive, false).encodeABI();
			sendTransaction( 3, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					assert.equal( true, false );
				} else {
					assert.equal( res.status, true);
				}
				done();
			});
		});
		it("PTC2 - third positive vote for Contract 1",(done)=>{
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.voteContractAddress(positive, true).encodeABI();
			sendTransaction( 4, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					assert.equal( true, false );
				} else {
					assert.equal( res.status, true);
				}
				done();
			});
		});
		it("PTC3 - second negative vote for Contract 2",(done)=>{
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.voteContractAddress(negative, false).encodeABI();
			sendTransaction( 2, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					assert.equal( true, false );
				} else {
					assert.equal( res.status, true);
				}
				done();
			});
		});
		it("PTC4 - third negative vote for Contract 2",(done)=>{
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.voteContractAddress(negative, false).encodeABI();
			sendTransaction( 3, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					assert.equal( true, false );
				} else {
					assert.equal( res.status, true);
				}
				done();
			});
		});
		it("PTC5 - re-create a proposal for Contract 1",(done)=>{
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.createAddressUpdateProposal(positive,accountAddresses[2],3).encodeABI();
			sendTransaction( 0, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					assert.equal( true, false );
				} else {
					assert.equal( res.status, true);
				}
				done();
			});
		});
		it("PTC6 - re-create a proposal for Contract 2",(done)=>{
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.createAddressUpdateProposal(negative,accountAddresses[2],3).encodeABI();
			sendTransaction( 0, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					assert.equal( true, false );
				} else {
					assert.equal( res.status, true);
				}
				done();
			});
		});
	});

	describe("createStakeholderUpdate", () => {
		it("PTC1 - Propose to add a stakeholder", (done) => {
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.createStakeholderUpdate(tempAddress, true).encodeABI();
			sendTransaction( 0, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					assert.equal( true, false );
				} else {
					assert.equal( res.status, true);
				}
				done();
			});
		});
		it("NTC1 - Propose to add same stakeholder", (done) => {
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.createStakeholderUpdate(tempAddress, true).encodeABI();
			sendTransaction( 1, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					done( null, true);
				} else if ( res && !res.status ) {
					done( null, true);
				} else {
					done( new Error("Should Not Go Through"), null);
				}
			});
		});
	});

	describe("Vote stakeholder", ()=>{
		it("PTC1 - second positive vote for adding stakeholder", (done) => {
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.voteStakeholder(tempAddress, true).encodeABI();
			sendTransaction( 1, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					assert.equal( true, false );
				} else {
					assert.equal( res.status, true);
				}
				done();
			});
		});
		it("NTC1 - retry casting vote", (done) => {
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.voteStakeholder(tempAddress, true).encodeABI();
			sendTransaction( 1, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					done( null, true);
				} else if ( res && !res.status ) {
					done( null, true);
				} else {
					done( new Error("Should Not Go Through"), null);
				}
			});
		});
		it("PTC2 - third positive vote for adding stakeholder", (done) => {
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.voteStakeholder(tempAddress, true).encodeABI();
			sendTransaction( 2, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					assert.equal( true, false );
				} else {
					assert.equal( res.status, true);
				}
				done();
			});
		});
		it("NTC2 - Fail to Cast vote after n/2+1 votes have been cast", (done) => {
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.voteStakeholder(tempAddress, true).encodeABI();
			sendTransaction( 3, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					done( null, true);
				} else if ( res && !res.status ) {
					done( null, true);
				} else {
					done( new Error("Should Not Go Through"), null);
				}
			});
		});
	});

	describe("createGlobalPauseProposal", () => {
		it("PTC1 - Propose to Pause the contract", (done) => {
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.createGlobalPauseProposal(2, true).encodeABI();
			sendTransaction( 0, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					assert.equal( true, false );
				} else {
					assert.equal( res.status, true);
				}
				done();
			});
		});
		it("NTC1 - Propose to pause contract when a proposal already exists", (done) => {
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.createGlobalPauseProposal(2, false).encodeABI();
			sendTransaction( 1, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					done( null, true);
				} else if ( res && !res.status ) {
					done( null, true);
				} else {
					done( new Error("Should Not Go Through"), null);
				}
			});
		});
	});

	describe("votePauseProposal", ()=>{
		it("PTC1 - second vote to pause contract", (done) => {
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.votePauseProposal(true).encodeABI();
			sendTransaction( 1, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					assert.equal( true, false );
				} else {
					assert.equal( res.status, true);
				}
				done();
			});
		});
		it("NTC1 - 2nd positive vote for Contract 1 when paused",(done)=>{
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.voteContractAddress(positive, true).encodeABI();
			sendTransaction( 1, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					done( null, true);
				} else if ( res && !res.status ) {
					done( null, true);
				} else {
					done( new Error("Should Not Go Through"), null);
				}
			});
		});
	});

	describe("unpause Contract", ()=>{
		it("PTC1 - Propose to unpause the contract", (done) => {
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.createGlobalPauseProposal(4, false).encodeABI();
			sendTransaction( 0, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					assert.equal( true, false );
				} else {
					assert.equal( res.status, true);
				}
				done();
			});
		});
		it("PTC2 - second vote to unpause contract", (done) => {
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.votePauseProposal(false).encodeABI();
			sendTransaction( 2, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					assert.equal( true, false );
				} else {
					assert.equal( res.status, true);
				}
				done();
			});
		});
		it("PTC1 - 2nd positive vote for Contract 1 when unpaused",(done)=>{
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.voteContractAddress(positive, true).encodeABI();
			sendTransaction( 1, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					assert.equal( true, false );
				} else {
					assert.equal( res.status, true);
				}
				done();
			});
		});
	});

	describe("pause and unpause method", ()=>{
		it("PTC1 - pause stakeholder update", (done) => {
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.pauseMethod("updateStakeholder").encodeABI();
			sendTransaction( 0, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					assert.equal( true, false );
				} else {
					assert.equal( res.status, true);
				}
				done();
			});
		});
		it("NTC1 - Propose to remove a stakeholder", (done) => {
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.createStakeholderUpdate(tempAddress, false).encodeABI();
			sendTransaction( 0, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					done( null, true);
				} else if ( res && !res.status ) {
					done( null, true);
				} else {
					done( new Error("Should Not Go Through"), null);
				}
			});
		});
		it("PTC2 - pause stakeholder update", (done) => {
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.unpauseMethod("updateStakeholder").encodeABI();
			sendTransaction( 0, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					assert.equal( true, false );
				} else {
					assert.equal( res.status, true);
				}
				done();
			});
		});
		it("PTC3 - Propose to remove a stakeholder", (done) => {
			const IndexContract = new web3.eth.Contract(abi, contractAddress);
			const methodData = IndexContract.methods.createStakeholderUpdate(tempAddress, false).encodeABI();
			sendTransaction( 0, methodData, contractAddress, ( err, res )=>{
				if ( err ) {
					assert.equal( true, false );
				} else {
					assert.equal( res.status, true);
				}
				done();
			});
		});
	})
})