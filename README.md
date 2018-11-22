# testsmartcontracts
This repo is created to test smart contracts without using truffle for deploying and testing our smart contract

## Getting Started
This project 

### Clone the repo and install the project
- git clone https://github.com/ledgerium/testsmartcontracts.git 
- cd testsmartcontracts

### We also use truffle for compiling smart contract so truffle can be installed and run compile
- sudo npm install -g truffle
- truffle compile

### Run the smart contracts
- npm install
- node index.js hostname=localhost port=8545 readkeyconfig=true usecontractconfig=false testgreeter
- node index.js rinkeby readkeyconfig=true usecontractconfig=false deployERC20Mock
