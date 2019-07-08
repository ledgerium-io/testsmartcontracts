# testsmartcontracts
This repo is created to test smart contracts without using truffle for deploying and testing our smart contract

## Getting Started
This project 

### Clone the repo and install the project
- git clone https://github.com/ledgerium/testsmartcontracts.git 
- cd testsmartcontracts

### Smart Contracts are precompiled with command
- solc --overwrite --gas --bin --abi --optimize-runs=200 -o ./build/contracts ./contracts/contractname.sol
- Output files contractname.bin and contractname.abi are available in ./build/contracts folder. If not existing, program will exist with "file not found!" error

### Run the smart contracts
- npm install
- node index.js hostname=localhost port=8545 readkeyconfig=true testgreeter
- node index.js rinkeby readkeyconfig=true deployERC20Mock
- node index.js protocol=http hostname=localhost port=8545 readkeyconfig=true testInvoices=0x1234,790afdeb16ae5c22453f8eeee25038c314f09d64fc51b8e21a5a82225e54fde6
- node index.js protocol=http hostname=138.197.193.201 port=8545 readkeyconfig=true testgreeter
- node index.js protocol=http hostname=138.197.193.201 port=8545 readkeyconfig=true fromPubKey=NHmYPJHp4OA9TH6Cgod8CTV+eCRuHkeM0wj3L4fk8xs= toPubKey=cBYY4b9+yu053Zr2Bx13SAIfvt+5HQ9jdwxtnGJMT0Y= testprivateTransactions=138.197.193.201,159.89.142.250,159.203.21.124,94.237.76.121,10100,8545,8545,8545
- node index.js protocol=ws hostname=138.197.193.201 port=9000 testNewBlockEvent
