const Web3 = require('web3');
const utils =  require('./web3util');

var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
global.web3 = web3;

var privateKey = {};
var contractsList = {};
var accountAddressList = [];

var main = async function () {

  var returnVal = await utils.createAccountsAndManageKeys();
  accountAddressList = returnVal[0];
  privateKey = returnVal[1];

  var password = "password";
  var ethereumAccountsList = web3.eth.accounts;  
  if(ethereumAccountsList.length < 3)
  {
    await utils.personalImportAccount(privateKey[accountAddressList[0]],password);
    await utils.personalImportAccount(privateKey[accountAddressList[1]],password);
    await utils.personalImportAccount(privateKey[accountAddressList[2]],password);

    //Transfer some ether from coinbase account to newly created accounts!
    var coinbase = web3.eth.coinbase;
    //var receipt;
    receipt = await utils.sendMethodTransactionOld(coinbase,accountAddressList[0],"0x00",privateKey[coinbase],web3.toWei(15.0, "ether"));
    receipt = await utils.sendMethodTransactionOld(coinbase,accountAddressList[1],"0x00",privateKey[coinbase],web3.toWei(15.0, "ether"));
    receipt = await utils.sendMethodTransactionOld(coinbase,accountAddressList[2],"0x00",privateKey[coinbase],web3.toWei(15.0, "ether"));
  }
    
  //With assumption that accountAddressList[0],accountAddressList[1], accountAddressList[2] are present in etherum 
  //and needs to be unlocked before running the testcases. 
  await utils.unlockPersonalAccount(accountAddressList[0],password);
  await utils.unlockPersonalAccount(accountAddressList[1],password);
  await utils.unlockPersonalAccount(accountAddressList[2],password);

  global.accountAddressList = accountAddressList;
  global.privateKey = privateKey;
  global.contractsList = contractsList;

  global.owner = accountAddressList[0];
  console.log("owner",global.owner);
  global.recipient = accountAddressList[1];
  global.anotherAccount = accountAddressList[2];
  // console.log("recipient",global.recipient);
  // console.log("anotherAccount",global.anotherAccount);

  //await deployedERC20MockContract(global, global.contractsList);
  await deployedGreeterContract(global, global.contractsList);

  ethAccountToUse = accountAddressList[0];
  await accessEarlierGreeting(ethAccountToUse);
}
main();

async function deployedERC20MockContract(global, contractsList){

    var ethAccountToUse = accountAddressList[0];
    var privateKeyToUse = privateKey[ethAccountToUse];
    var deployedERC20MockAddress = contractsList["ERC20Mock"];
    // Todo: Read ABI from dynamic source.
    var filename = __dirname + "/build/contracts/ERC20Mock.json";
    var ERC20MockArray = utils.readSolidityContractJSON(filename);
    if(ERC20MockArray.length <= 0)
        return;
    if(deployedERC20MockAddress == undefined){
      
      var constructorParameters = [];
      constructorParameters.push(accountAddressList[0]);
      constructorParameters.push("1000000000000000000");
      
      //value[0] = Contract ABI and value[1] =  Contract Bytecode
      deployedERC20MockAddress = await utils.deployContractOldWeb3(ERC20MockArray[0],ERC20MockArray[1], ethAccountToUse, privateKeyToUse,constructorParameters);
      console.log("ERC20Mock deployedAddress ", deployedERC20MockAddress);
      //we dont need to read/write it in file as we want contract to deploy fresh everytime, test is run!
    }
    var mock20ERC = web3.eth.contract(JSON.parse(ERC20MockArray[0]));
    global.ERC20Mock = mock20ERC.at(deployedERC20MockAddress);
  }

  async function deployedGreeterContract(global, contractsList){

    var ethAccountToUse = accountAddressList[0];
    var privateKeyToUse = privateKey[ethAccountToUse];
    var deployedGreeterAddress = contractsList["Greeter"];
    // Todo: Read ABI from dynamic source.
    var filename = __dirname + "/build/contracts/Greeter.json";
    var GreeterArray = utils.readSolidityContractJSON(filename);
    if(GreeterArray.length <= 0)
        return;
    if(deployedGreeterAddress == undefined){
      
      var constructorParameters = [];
      constructorParameters.push("Hi Rahul");
      
      //value[0] = Contract ABI and value[1] =  Contract Bytecode
      deployedGreeterAddress = await utils.deployContractOldWeb3(GreeterArray[0],GreeterArray[1], ethAccountToUse, privateKeyToUse,constructorParameters);
      console.log("Greeter deployedAddress ", deployedGreeterAddress);
      //we dont need to read/write it in file as we want contract to deploy fresh everytime, test is run!
    }
    var GreeterContract = web3.eth.contract(JSON.parse(GreeterArray[0]));
    global.GreeterContract = GreeterContract.at(deployedGreeterAddress);
  }

  async function accessEarlierGreeting(){

    if(global.GreeterContract == undefined)
        return;

    var ethAccountToUse = accountAddressList[0];
    var result = await GreeterContract.getMyNumber();
    console.log("getMyNumber", result.toNumber());

    var owner = await GreeterContract.getOwner();
    console.log("getOwner", owner);

    var encodedABI, number = 10;
    
    do{
      encodedABI = await GreeterContract.setMyNumber.getData(number++);
      var transactionObject = await utils.sendMethodTransactionOld(ethAccountToUse,GreeterContract.address,encodedABI,privateKey[ethAccountToUse],200000);
      console.log("TransactionLog for Greeter setMyNumber -", transactionObject.transactionHash);
      await utils.sleep(2000);
    }
    while(number <= 1000000);

    var result1 = await GreeterContract.getMyNumber();
    console.log("getMyNumber", result1.toNumber());
}