const path = require("path");
const { extendEnvironment } = require("hardhat/config");
const { getVRFCoordinators, getVRFLaneHashes } = require("./utils/download");

const baseDir = path.resolve(
    __dirname, "..", "..", "data", "templates"
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
        path.resolve(baseDir, "solidity", "VRFConsumerV2Plus.sol.template"), "solidity", [
            solidityVersionArgument,
            {
                name: "CALLBACK_GAS_LIMIT",
                description: "The max. amount of gas per request",
                message: "Choose a max. gas amount for the requests (e.g. 4000)",
                initial: 4000,
                argumentType: "uint32"
            },
            {
                name: "REQUEST_CONFIRMATIONS",
                description: "The number of confirmations",
                message: "Choose a number of confirmations for the requests (e.g. 3)",
                initial: 3,
                argumentType: "uint16"
            },
            {
                name: "NUM_WORDS",
                description: "The number of random numbers per request",
                message: "Choose how many random numbers will be generated per request (e.g. 1)",
                initial: 1,
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
        "chainlink:vrf:coordinator-mock-contract", "VRFCoordinatorV2PlusMock", "A Chainlink VRFCoordinatorV2_5 mock contract",
        path.resolve(baseDir, "solidity", "VRFCoordinatorV2_5Mock.sol.template"), "solidity", [
            solidityVersionArgument,
            {
                name: "BASE_FEE",
                description: "The base fee for requests, expressed in LINK fractions",
                message: "Choose a max. gas amount for the requests",
                argumentType: "uint96",
                initial: 100000000000000000n
            },
            {
                name: "GAS_PRICE",
                description: "The gas price for requests, expressed in LINK fractions",
                message: "Choose a number of confirmations for the requests",
                argumentType: "uint96",
                initial: 1000000000n
            },
            {
                name: "WEI_PER_UNIT_LINK",
                description: "The LINK/NATIVE rate",
                message: "Choose the amount of native wei that costs a single LINK token",
                argumentType: "int256",
                initial: 7500000000000000n
            }
        ]
    );
    hre.blueprints.registerBlueprint(
        "chainlink:vrf:consumer-deployment", "VRFConsumerV2Plus", "An ignition module for a new Chainlink VRFConsumerV2Plus contract to be deployed in the local network",
        path.resolve(baseDir, "ignition-modules", "VRFConsumerV2Plus.js.template"), "ignition-module", [
            {
                name: "CONTRACT_NAME",
                description: "The type to use for the contract",
                message: "Choose one of your contract artifacts (must be a VRFConsumerV2Plus contract)",
                argumentType: "contract"
            },
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
                    type: "plus:hardhat:given-or-remote-value-select",
                    remoteValueType: "VRF Coordinator contracts",
                    loader: () => getVRFCoordinators()
                }
            }
        ]
    );
    hre.blueprints.registerBlueprint(
        "chainlink:vrf:nonlocal-consumer-deployment", "VRFConsumerV2Plus", "An ignition module for a new Chainlink VRFConsumerV2Plus contract to be deployed in the local network",
        path.resolve(baseDir, "ignition-modules", "VRFConsumerV2Plus.js.template"), "ignition-module", [
            {
                name: "CONTRACT_NAME",
                description: "The type to use for the contract",
                message: "Choose one of your contract artifacts (must be a VRFConsumerV2Plus contract)",
                argumentType: "contract"
            },
            {
                name: "SUBSCRIPTION_IGNITION_PARAMETER",
                initial: "subscriptionId",
                description: "The name of the ignition parameter that will hold the subscription id for this contract",
                message: "Choose a name for an ignition parameter that will hold the subscription id for this contract",
                argumentType: "identifier"
            },
            {
                name: "VRF_COORDINATOR",
                description: "The VRFCoordinator contract",
                message: "Choose the proper VRF Coordinator contract",
                argumentType: {
                    type: "plus:hardhat:given-or-remote-value-select",
                    remoteValueType: "VRF Coordinator contracts",
                    loader: () => getVRFCoordinators()
                }
            },
            {
                name: "KEY_HASH",
                description: "The gas lane to use",
                message: "Choose the proper gas lane to use (check Chainlink's docs for the network to understand the gas prices)",
                argumentType: {
                    type: "plus:hardhat:given-or-remote-value-select",
                    remoteValueType: "VRF gas lanes",
                    loader: () => getVRFLaneHashes()
                }
            }
        ]
    );

    // TODO:
    // Task to invoke: function addConsumer(uint256 subId, address consumer) external
    // Task to invoke: function removeConsumer(uint256 subId, address consumer) external
    // [ONLY IN A MOCK]
    // Task to invoke: function fundSubscription(uint256 _subId, uint256 _amount) public
    // [ONLY IN A MOCK]
    // Task to list SubscriptionCreated events (with indexed: subId)
    // >>> For each, listing the prices with getSubscription(subId) returning:
    //     (uint96 balance, uint96 nativeBalance, uint64 reqCount, address subOwner, address[] memory consumers)
    // Task to invoke: function getSubscription(uint256 subId) public returns (... same as before ...)
    // Task to invoke: function fulfillRandomWords(uint256 _requestId, address _consumer) external
    // [ONLY IN A MOCK]
    // Task to launch a worker which attends these events:
    //     event RandomWordsRequested(
    //         bytes32 indexed keyHash,
    //         uint256 requestId,
    //         uint256 preSeed,
    //         uint256 indexed subId,
    //         uint16 minimumRequestConfirmations,
    //         uint32 callbackGasLimit,
    //         uint32 numWords,
    //         bytes extraArgs,
    //         address indexed sender
    //     );
    // and based on it invokes the fulfillRandomWords(requestId, sender) method.
});