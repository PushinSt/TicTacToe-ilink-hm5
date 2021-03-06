
import { HardhatRuntimeEnvironment } from 'hardhat/types';

module.exports = async function (hre: HardhatRuntimeEnvironment) {
  console.log(`ChainId: ${await hre.getChainId()}`)

  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;

  const { deployer, alice } = await getNamedAccounts();
  const balance = await ethers.provider.getBalance(deployer)

  console.log(`Deployer: ${deployer} , balance: ${ethers.utils.formatEther(balance)} `)


  const name = 'ERC20Mock'
  const symbol = 'ERC'
  const totalSupply = 1000000

  const erc = await deploy('ERC20Mock', {
    args: [
      name,
      symbol,
      totalSupply
    ],
    from: deployer,
    log: true,
  });

  await deploy('TicTacToe', {
    args: [],
    contract: 'TicTacToe',
    from: deployer,
    proxy: {
      //owner: deployer,
      proxyContract: 'OpenZeppelinTransparentProxy',
      execute: {
        init: {
          methodName: 'initialize',
          args: [erc.address],
        },
      },
    },
    log: true,
  });

};

module.exports.tags = ["TicTacToe"];

