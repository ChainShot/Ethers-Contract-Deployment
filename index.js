const ethers = require('ethers');
const solc = require('solc');
const ganache = require("ganache-core");

const randomWallet = ethers.Wallet.createRandom();
const ganacheProvider = ganache.provider({ accounts: [{
    balance: ethers.utils.parseEther("10").toString(),
    secretKey: randomWallet.privateKey,
}]});

const provider = new ethers.providers.Web3Provider(ganacheProvider);
const wallet = randomWallet.connect(provider);

const content = `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.7.4;
    contract Contract {
        uint public x;
        constructor(uint _x, uint _y) {
            emit Deployed();
            x = _x + _y;
        }

        event Deployed();

        function halfX() public view returns(uint) {
          return x / 2;
        }
    }
`;

const input = {
    language: 'Solidity',
    sources: { 'contract.sol': { content } },
    settings: { outputSelection: { '*': { '*': ['*'] } } }
};
const output = JSON.parse(solc.compile(JSON.stringify(input)));

async function deploy() {
  const { Contract: { abi, evm: { bytecode }}} = output.contracts['contract.sol'];
  const factory = new ethers.ContractFactory(abi, bytecode.object, wallet);
  const contract = await factory.deploy(10, 20);

  contract.on('Deployed', () => {
    console.log("deployed!");
  });
}

deploy();
