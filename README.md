# **Getting Started**
This repo provides utility functions to test different scenarios on Ledgerium Blockchain e.g. deploy public and private smart contracts, execute transactions using web3js.

## **Clone the repo and install the project**
- git clone https://github.com/ledgerium-io/ledgeriumtestutility.git 
- cd ledgeriumtestutility
- yarn install

### **Specifications**
The ledgeriumtestutility can be used with different switches

**protocol**
- ws
- http

**hostname**
- localhost
- XXX.XXX.XXX.XXX

**port**
- e.g. 9000 for Websocket
- e.g. 8545 for HTTP

**readkeyconfig**
- if keystore\privatekey.json needs to be used for accounts and respective their private keys

**generatetlscerts**
- Generate the TLS certificates needed for communicating with tessera node using https for private transactions. The subject information used for creating the certificates can be found in certs/config.json. When regenerating the certificates, we recommend to use unique subject information

### **Run the tests - Usages**
- **Deploy LedgeriumToken ERC20 smart contract on Ledgerium Blockchain**
  ```
  node index.js protocol=<http/ws> hostname=<masternode node ip address> port=<rpc/ws port> readkeyconfig=true testLedgeriumToken
  ```

- **Add Invoice hash to Invoice smart contract on Ledgerium Blockchain**
  ```
  node index.js protocol=<http/ws> hostname=<masternode node ip address> port=<rpc/ws port> readkeyconfig=true testInvoices=<InvoiceID>,<Invoice Hash>
  ```

- **Transfer XLG from one account to another account on Ledgerium Blockchain**
  ```
  node index.js protocol=<http/ws> hostname=<masternode ip address> port=<rpc/ws port> transferXLG=<private key of 'from' account>,<to account address>,<XLG amount>
  ```

- **Import account to the given masternode of Ledgerium Blockchain**
  ```
  node index.js protocol=<http/ws> hostname=<masternode node ip address> port=<rpc/ws port> testPersonalImportAccount=<private key> <password>
  ```

- **Deploy Greeter smart contract on Ledgerium Blockchain**
  ```
  node index.js protocol=<http/ws> hostname=<masternode node ip address> port=<rpc/ws port> readkeyconfig=true testgreeter
  ```

- **Deploy SimpleStorage smart contract on Ledgerium Blockchain**
  ```
  node index.js protocol=<http/ws> hostname=<ledgeriumcore node ip address> port=<rpc/ws port> readkeyconfig=true testsimplestorage
  ```

- **Deploy Greeter smart contract in private transaction between Node 'from' and Node 'to' on Ledgerium Blockchain**
  ```
  node index.js protocol=<http/ws> hostname=<masternode node ip address> port=<rpc/ws port> readkeyconfig=true fromPubKey=<public key of 'from' node> toPubKey=<public key of 'to' node> testprivateTransactions=<From Node>,<To Node>,<Node1>,<Node2>,<tessera third party port of 'from' node>,<RPC Port To Node>,<RPC Port Node1>,<RPC Port Node2>
  ```

- **Deploy SimpleStorage smart contract in private transaction between Node 'from' and Node 'to' on Ledgerium Blockchain**
  ```
  node index.js protocol=<http/ws> hostname=<masternode node ip address> port=<rpc/ws port> readkeyconfig=true fromPubKey=<public key of 'from' node> toPubKey=<public key of 'to' node> testSimpleStoragePrivate=<From Node>,<To Node>,<Node1>,<Node2>,<tessera third party port of 'from' node>,<RPC Port To Node>,<RPC Port Node1>,<RPC Port Node2>
  ```

- **Deploy Greeter smart contract in private transaction between Node 'from' and Node 'to' and run setMyNumber on Ledgerium Blockchain**
  ```
  node index.js protocol=<http/ws> hostname=<masternode node ip address> port=<rpc/ws port> readkeyconfig=true fromPubKey=<public key of 'from' node> toPubKey=<public key of 'to' node> transactOnPrivateContract=<From Node>,<To Node>,<Node1>,<Node2>,<tessera third party port of 'from' node>,<RPC Port To Node>,<RPC Port Node1>,<RPC Port Node2>, <Greeter smart contract address on ledgerium blockchain> 
  ```

- **Special test scenario to add new node entries in networkmanager contract on Ledgerium Blockchain reading from nodesdetails json**
  ```
  node index.js protocol=<http/ws> hostname=<ledgeriumcore node ip address> port=<rpc/ws port> readkeyconfig=true testNetworkManagerContract=<nodesdetails.json>
  ```

- **Special test scenario to bring no of peer nodes of the given masternode to no of node in networkmanager contract on Ledgerium Blockchain**
  ```
  node index.js protocol=<http/ws> hostname=<ledgeriumcore node ip address> port=<rpc/ws port> readkeyconfig=true usecontractconfig=true synchPeers 
  ```

- **Subscribe the 'newBlockHeaders' event on Ledgerium Blockchain**
  ```
  node index.js protocol=<http/ws> hostname=<ledgeriumcore node ip address> port=<rpc/ws port> readkeyconfig=true testNewBlockEvent
  ```

- **Generate the public/private key combination against input of mnemonics on Ledgerium Blockchain**
  ```
  node index.js createprivatepubliccombo=<mnemonics string>
  ``` 

- **Deploy ERC20Mock smart contract on Ethereum testnet 'Rinkeby'**  
  ```
  node index.js readkeyconfig=true rinkeby deployERC20Mock
  ```
## **Additional:**
### **Smart Contracts are compiled with following commands**  
### **Solidity compiler to compile smart contract, to be deployed and transact**
- solc --overwrite --gas --bin --abi --optimize-runs=200 -o ./build/contracts ./contracts/contractname.sol
- Output files contractname.bin and contractname.abi are available in ./build/contracts folder. If file does not exist, program will throw "file not found!" error

### **Precompiled smart contract are deployed from the genesis block using --bin-runtime.**
- solc --overwrite --gas --bin-runtime --abi --optimize-runs=200 -o ./build/contracts ./contracts/contractname.sol
- Output files contractname.bin and contractname.abi are available in ./build/contracts folder. If file dpes not exist, program will throw "file not found!" error

