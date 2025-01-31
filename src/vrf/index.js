const path = require("path");
const { extendEnvironment } = require("hardhat/config");

const baseDir = path.resolve(
    __dirname, "..", "..", "data", "templates", "ignition-modules"
);

extendEnvironment((hre) => {
    const solidityVersionArgument = {
        name: "SOLIDITY_VERSION",
        description: "The Solidity version for the new file",
        message: "Choose the solidity version for this file",
        argumentType: "solidity"
    };

    hre.blueprints.registerBlueprint(
        "chainlink:vrf:consumer-contract", "VRFConsumerV2Plus", "A Chainlink VRFConsumerV2Plus contract",
        path.resolve(baseDir, "VRFConsumerV2Plus.sol.template"), "solidity", [
            solidityVersionArgument,
            {
                name: "CALLBACK_GAS_LIMIT",
                description: "The max. amount of gas per request",
                message: "Choose a max. gas amount for the requests (e.g. 4000)",
                argumentType: "uint32"
            },
            {
                name: "REQUEST_CONFIRMATIONS",
                description: "The number of confirmations",
                message: "Choose a number of confirmations for the requests (e.g. 3)",
                argumentType: "uint16"
            },
            {
                name: "NUM_WORDS",
                description: "The number of random numbers per request",
                message: "Choose how many random numbers will be generated per request (e.g. 1)",
                argumentType: "uint32"
            },
            {
                name: "USE_NATIVE_PAYMENTS",
                description: "Whether to consume native payments (true, yes) or LINK payments (false, no) from the subscription",
                message: "Will this contract consume Native tokens from the subscription? (if not, it will use LINK tokens)",
                argumentType: "boolean"
            }
        ]
    );
    hre.blueprints.registerBlueprint(
        "chainlink:vrf:consumer-deployment", "VRFConsumerV2Plus", "An ignition module for a new Chainlink VRFConsumerV2Plus contract",
        path.resolve(baseDir, "VRFConsumerV2Plus.js.template"), "solidity", [
            solidityVersionArgument,
            {
                name: "SUBSCRIPTION_ID",
                description: "The id of the subscription to use",
                message: "Choose the id of the subscription to use (it must belong to the current network)",
                argumentType: "uint256"
            },
            {
                name: "VRF_COORDINATOR",
                description: "The VRFCoordinator contract",
                message: "Choose the proper VRF Coordinator contract",
                argumentType: {
                    // TODO, but will be an address.
                }
            },
            {
                name: "KEY_HASH",
                description: "The gas lane to use",
                message: "Choose the proper gas lane to use (check Chainlink's docs for the network to understand the gas prices)",
                argumentType: {
                    // TODO, but will be a bytes32.
                }
            }
        ]
    );

});