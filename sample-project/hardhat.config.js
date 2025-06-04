require("@nomicfoundation/hardhat-toolbox");
require("@chainlink/functions-toolkit");
require("hardhat-enquirer-plus");
require("hardhat-common-tools");
require("hardhat-blueprints");
require("hardhat-method-prompts");
require("hardhat-ignition-deploy-everything");
require("..");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337 // Default Hardhat Network ID
    },
    amoy: {
      url: "https://polygon-amoy-bor-rpc.publicnode.com", // Replace with your provider
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80002
    },
    polygon: {
      url: "https://polygon-rpc.com", // Replace with your provider
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 137 // Polygon Mainnet Chain ID
    }
  }
};
