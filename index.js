'use strict';
const fs = require('fs');
const Web3 = require('web3');
const Utils =  require('./web3util');


var provider;
var host,port;
var web3;

const utils = new Utils();
global.utils = utils;

var privateKey = {};
var accountAddressList = [];
var contractsList = {};
var usecontractconfigFlag;

global.contractsList = contractsList;

var main = async function () {

  const args = process.argv.slice(2);
  for (let i=0; i<args.length ; i++) {
      let temp = args[i].split("=");
      switch (temp[0]) {
          case "hostname":
              host = temp[1];
              global.host = host;
              break;
          case "port":
              port = temp[1];
              global.port = port;
              let URL = "http://" + host + ":" + port;
              web3 = new Web3(new Web3.providers.HttpProvider(URL));
              global.web3 = web3;
              break;
          case "privateKeys":
              let prvKeys = temp[1].split(",");
              utils.createAccountsAndManageKeysFromPrivateKeys(prvKeys);
              utils.writeAccountsAndKeys();
              break;
          case "readkeyconfig":
              let readkeyconfig = temp[1];
              switch(readkeyconfig){
                  case "true":
                  default: 
                      utils.readAccountsAndKeys();
                      break;
                  case "false":
                      console.log("Given readkeyconfig option not supported! Provide correct details");
                      break;     
              }
              break;
          case "usecontractconfig":
              let usecontractconfig = temp[1];
              switch(usecontractconfig){
                  case "true":
                      utils.readContractsFromConfig();
                      usecontractconfigFlag = true;
                      break;
                  case "false":
                      // if(accountAddressList.length < 3){
                      //     console.log("Ethereum accounts are not available! Can not proceed further!!");
                      //     return;
                      // }
                      break;
                  default:
                      console.log("Given usecontractconfig option not supported! Provide correct details");
                      break;
              }
              break;
          case "rinkeby":
              let HDWalletProvider = require("truffle-hdwallet-provider");
              provider = new HDWalletProvider(privateKey[accountAddressList[0]], "https://rinkeby.infura.io/v3/931eac1d45254c16acc71d0fc11b88f0");
              web3 = new Web3();
              web3.setProvider(provider);
              global.web3 = web3;
              break;
          case "testgreeter":
              await testGreetingContract();
              break;
          case "deployERC20Mock":
              await deployERC20MockContract();
              break;
          case "deployERC20":
              await deployERC20Contract();
              break;
          case "testPersonalImportAccount":
              await testPersonalImportAccount();
              break;
          default:
              //throw "command should be of form :\n node deploy.js host=<host> file=<file> contracts=<c1>,<c2> dir=<dir>";
              break;
      }
  }

  if(provider)
      provider.engine.stop();
  return;
}

main();

async function deployERC20MockContract(){

    accountAddressList = global.accountAddressList;
    privateKey = global.privateKey;

    var ethAccountToUse = accountAddressList[0];
    
    // Todo: Read ABI from dynamic source.
    var filename = __dirname + "/build/contracts/ERC20Mock.json";
    var value = utils.readSolidityContractJSON(filename);
    if(value.length <= 0)
        return;
    
    var deployedERC20MockAddress;
    if(!usecontractconfigFlag){
        let constructorParameters = [];
        constructorParameters.push(accountAddressList[0]);
        constructorParameters.push("2500");
        //value[0] = Contract ABI and value[1] =  Contract Bytecode
        //var deployedERC20MockAddress = "0x0000000000000000000000000000000000002020";
        let encodedABI = await utils.getContractEncodeABI(value[0], value[1],web3,constructorParameters);
        let transactionHash = await utils.sendMethodTransaction(ethAccountToUse,undefined,encodedABI,privateKey[ethAccountToUse],web3,0);
        deployedERC20MockAddress = transactionHash.contractAddress;
        console.log("ERC20Mock deployedAddress ", deployedERC20MockAddress);

        utils.writeContractsINConfig("ERC20Mock",deployedERC20MockAddress);
    }
    else{
        deployedERC20MockAddress = utils.readContractFromConfigContracts("ERC20Mock");
    }    
    
    var mock20ERC = new web3.eth.Contract(JSON.parse(value[0]),deployedERC20MockAddress);
    global.ERC20Mock = mock20ERC;

    var result = await mock20ERC.methods.totalSupply().call();
    console.log("totalSupply", result);

    var result = await mock20ERC.methods.balanceOf(ethAccountToUse).call();
    console.log("balanceOf", result, "of account", ethAccountToUse);

    var result = await mock20ERC.methods.balanceOf(accountAddressList[1]).call();
    console.log("balanceOf", result, "of account",  accountAddressList[1]);
    
    let encodedABI = mock20ERC.methods.transfer(accountAddressList[1],123).encodeABI();
    var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20MockAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    console.log("TransactionLog for ERC20Mock transfer -", transactionObject.transactionHash);

    result = await mock20ERC.methods.balanceOf(accountAddressList[1]).call();
    console.log("balanceOf", result, "of account",  accountAddressList[1]);

    result = await mock20ERC.methods.balanceOf(accountAddressList[0]).call();
    console.log("balanceOf", result, "of account",  accountAddressList[0]);
}

async function testGreetingContract(){
    
      accountAddressList = global.accountAddressList;
      privateKey = global.privateKey;  
  
      // Todo: Read ABI from dynamic source.
      var value = utils.readSolidityContractJSON("./build/contracts/Greeter.json");
      if(value.length <= 0){
          return;
      }
      var ethAccountToUse = accountAddressList[0];
      var deployedAddressGreeter;
      if(!usecontractconfigFlag){
          let constructorParameters = [];
          constructorParameters.push("Hi Ledgerium");
          //value[0] = Contract ABI and value[1] =  Contract Bytecode
          //var deployedAddressGreeter = "0x0000000000000000000000000000000000002020";
          let encodedABI = await utils.getContractEncodeABI(value[0], value[1],web3,constructorParameters);
          let transactionHash = await utils.sendMethodTransaction(ethAccountToUse,undefined,encodedABI,privateKey[ethAccountToUse],web3,0);
          deployedAddressGreeter = transactionHash.contractAddress;
          console.log("Greeter deployedAddress ", deployedAddressGreeter);

          utils.writeContractsINConfig("Greeter",deployedAddressGreeter);
      }
      else{
          deployedAddressGreeter = utils.readContractFromConfigContracts("Greeter");
      }
      
      var greeting = new web3.eth.Contract(JSON.parse(value[0]),deployedAddressGreeter);
      global.greeting = greeting;
      
      var result = await greeting.methods.getMyNumber().call({from : ethAccountToUse});
      console.log("getMyNumber", result);
      
      let encodedABI = greeting.methods.setMyNumber(499).encodeABI();
      var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedAddressGreeter,encodedABI,privateKey[ethAccountToUse],web3,0);
      console.log("TransactionLog for Greeter Setvalue -", transactionObject.transactionHash);

      result = await greeting.methods.getMyNumber().call({from : ethAccountToUse});
      console.log("getMyNumber after", result);
}

// async function deployERC20Contract(){

//     accountAddressList = global.accountAddressList;
//     privateKey = global.privateKey;

//     var ethAccountToUse = accountAddressList[0];
    
//     // Todo: Read ABI from dynamic source.
//     var filename = __dirname + "/build/contracts/ERC20.json";
//     var value = utils.readSolidityContractJSON(filename);
//     if(value.length <= 0)
//         return;
    
//     var deployedERC20Address;
//     if(!usecontractconfigFlag){
//         let constructorParameters = [];
//         constructorParameters.push(accountAddressList[0]);
//         constructorParameters.push("2500");
//         //value[0] = Contract ABI and value[1] =  Contract Bytecode
//         //var deployedERC20Address = "0x0000000000000000000000000000000000002020";
//         let encodedABI = await utils.getContractEncodeABI(value[0], value[1],web3,constructorParameters);
//         let transactionHash = await utils.sendMethodTransaction(ethAccountToUse,undefined,encodedABI,privateKey[ethAccountToUse],web3,0);
//         deployedERC20Address = transactionHash.contractAddress;
//         console.log("ERC20 deployedAddress ", deployedERC20Address);

//         utils.writeContractsINConfig("ERC20",deployedERC20Address);
//     }
//     else{
//         deployedERC20Address = utils.readContractFromConfigContracts("ERC20");
//     }    
    
//     var mock20ERC = new web3.eth.Contract(JSON.parse(value[0]),deployedERC20Address);
//     global.ERC20 = mock20ERC;

//     var result = await mock20ERC.methods.totalSupply().call();
//     console.log("totalSupply", result);

//     var result = await mock20ERC.methods.balanceOf(ethAccountToUse).call();
//     console.log("balanceOf", result, "of account", ethAccountToUse);

//     var result = await mock20ERC.methods.balanceOf(accountAddressList[1]).call();
//     console.log("balanceOf", result, "of account",  accountAddressList[1]);
    
//     let encodedABI = mock20ERC.methods.transfer(accountAddressList[1],123).encodeABI();
//     var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,deployedERC20Address,encodedABI,privateKey[ethAccountToUse],web3,0);
//     console.log("TransactionLog for ERC20 transfer -", transactionObject.transactionHash);

//     result = await mock20ERC.methods.balanceOf(accountAddressList[1]).call();
//     console.log("balanceOf", result, "of account",  accountAddressList[1]);

//     result = await mock20ERC.methods.balanceOf(accountAddressList[0]).call();
//     console.log("balanceOf", result, "of account",  accountAddressList[0]);
// }

async function testPersonalImportAccount() {

    accountAddressList = global.accountAddressList;
    privateKey = global.privateKey;  
  
    var password = "password";
    //var ethereumAccountsList = await web3.eth.accounts;
    //console.log("No of Ethereum accounts on the node ",ethereumAccountsList.length);
    //if(ethereumAccountsList.length < 3)
    {
      await utils.personalImportAccount(privateKey[accountAddressList[0]],password);
      await utils.personalImportAccount(privateKey[accountAddressList[1]],password);
      await utils.personalImportAccount(privateKey[accountAddressList[2]],password);

      //Transfer some ether from coinbase account to newly created accounts!
      var coinbase = await web3.eth.coinbase;
      //var receipt;
      receipt = await utils.sendMethodTransactionOld(coinbase,accountAddressList[0],"0x00",privateKey[coinbase],web3.toWei(1.0, "ether"),web3);
      receipt = await utils.sendMethodTransactionOld(coinbase,accountAddressList[1],"0x00",privateKey[coinbase],web3.toWei(1.0, "ether"),web3);
      receipt = await utils.sendMethodTransactionOld(coinbase,accountAddressList[2],"0x00",privateKey[coinbase],web3.toWei(1.0, "ether"),web3);
    }
      
    //With assumption that accountAddressList[0],accountAddressList[1], accountAddressList[2] are present in etherum 
    //and needs to be unlocked before running the testcases. 
    await utils.unlockPersonalAccount(accountAddressList[0],password);
    await utils.unlockPersonalAccount(accountAddressList[1],password);
    await utils.unlockPersonalAccount(accountAddressList[2],password);
}
  
