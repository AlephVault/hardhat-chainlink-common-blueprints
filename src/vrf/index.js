const path = require("path");
const {extendEnvironment} = require("hardhat/config");
const {getVRFCoordinators, getVRFLaneHashes} = require("./utils/download");
const {getProjectFiles} = require("../common/utils/files");

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

    new hre.methodPrompts.ContractMethodPrompt(
        "send", "addConsumer", {
            onError: (e) => {
                console.error("There was an error while running this method");
                console.error(e);
            },
            onSuccess: (tx) => {
                console.log("tx:", tx);
            }
        }, [
            {
                name: "subscriptionId",
                description: "The id of the subscription to add the consumer contract address to",
                message: "Choose the id of the subscription to add the consumer contract address to",
                argumentType: "uint256"
            },
            {
                name: "consumerAddress",
                description: "The address of the consumer contract (intended for VRFConsumer V2 / V2Plus contracts)",
                message: "Choose the address of the consumer contract (a VRFConsumer V2 / V2Plus one, here)",
                argumentType: "address"
            }
        ], {}
    ).asTask(
        "chainlink:vrf:add-subscription-consumer",
        "Invokes addConsumer on a VRF coordinator V2 / V2.5 contract for a given consumer"
    );

    new hre.methodPrompts.ContractMethodPrompt(
        "send", "removeConsumer", {
            onError: (e) => {
                console.error("There was an error while running this method");
                console.error(e);
            },
            onSuccess: (tx) => {
                console.log("tx:", tx);
            }
        }, [
            {
                name: "subscriptionId",
                description: "The id of the subscription to remove the consumer contract address from",
                message: "Choose the id of the subscription to remove the consumer contract address from",
                argumentType: "uint256"
            },
            {
                name: "consumerAddress",
                description: "The address of the consumer contract (intended for VRFConsumer V2 / V2Plus contracts)",
                message: "Choose the address of the consumer contract (a VRFConsumer V2 / V2Plus one, here)",
                argumentType: "address"
            }
        ], {}
    ).asTask(
        "chainlink:vrf:remove-subscription-consumer",
        "Invokes removeConsumer on a VRF coordinator V2 / V2.5 contract for a given VRFConsumer V2 / V2Plus contract"
    );

    new hre.methodPrompts.ContractMethodPrompt(
        "custom", async (contract) => {
            return await hre.common.getLogs(contract, "SubscriptionCreated");
        }, {
            onError: (e) => {
                console.error("There was an error while running this method");
                console.error(e);
            },
            onSuccess: (data) => {
                console.log(`Subscriptions: ${data.length || 'no'} elements`);
                data.forEach(({args: {subId}}) => {
                    console.log("Subscription id:", subId);
                })
            }
        }, [], {}
    ).asTask(
        "chainlink:vrf:list-subscriptions",
        "Lists the subscriptions from a VRF coordinator V2 / V2.5 contract"
    );

    new hre.methodPrompts.ContractMethodPrompt(
        "call", "getSubscription", {
            onError: (e) => {
                console.error("There was an error while running this method");
                console.error(e);
            },
            onSuccess: (data) => {
                // Data is: (uint96 balance, uint96 nativeBalance, uint64 reqCount, address subOwner, address[] memory consumers)
                console.log("Subscription data:", data);
            }
        }, [
            {
                name: "subscriptionId",
                description: "The id of the subscription to retrieve",
                message: "Choose the id of the subscription to retrieve",
                argumentType: "uint256"
            },
        ], {}
    ).asTask(
        "chainlink:vrf:get-subscription",
        "Invokes getSubscription on a VRF coordinator V2 / V2.5 contract"
    );

    if (["hardhat", "localhost"].includes(hre.network.name)) {
        hre.blueprints.registerBlueprint(
            "chainlink:vrf:consumer-deployment", "VRFConsumerV2Plus", "A Chainlink VRFConsumerV2Plus deployment module to be used in the local network",
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
                    message: "Choose the id of the subscription to use (it can be an arbitrary value)",
                    argumentType: "uint256"
                },
                {
                    name: "VRF_COORDINATOR_MODULE",
                    description: "The VRFCoordinator deployment file",
                    message: "Choose the proper VRF Coordinator deployment file",
                    argumentType: {
                        type: "plus:given-or-select",
                        choices: getProjectFiles(hre, "ignition/modules", ["js", "ts"])
                    }
                }
            ]
        );

        hre.blueprints.registerBlueprint(
            "chainlink:vrf:coordinator-mock-contract", "VRFCoordinatorV2PlusMock", "A Chainlink VRFCoordinatorV2_5Mock contract to be used in the local network",
            path.resolve(baseDir, "solidity", "VRFCoordinatorV2_5Mock.sol.template"), "solidity", [
                solidityVersionArgument,
                {
                    name: "BASE_FEE",
                    description: "The base fee for requests, expressed in LINK fractions",
                    message: "Choose a base fee for the requests",
                    argumentType: "uint96",
                    initial: 100000000000000000n
                },
                {
                    name: "GAS_PRICE",
                    description: "The gas price for requests, expressed in LINK fractions",
                    message: "Choose a gas price for the requests",
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
            "chainlink:vrf:coordinator-mock-deployment", "VRFCoordinatorV2_5Mock", "A Chainlink VRFCoordinatoeV2_5Mock deployment module to be used in the local network",
            path.resolve(baseDir, "ignition-modules", "VRFCoordinatorV2_5Mock.js.template"),
            "ignition-module", [
                {
                    name: "CONTRACT_NAME",
                    description: "The type to use for the contract",
                    message: "Choose one of your contract artifacts (it must be a VRFCoordinatorV2_5Mock contract)",
                    argumentType: "contract"
                }
            ]
        );

        new hre.methodPrompts.ContractMethodPrompt(
            "custom", async (contract) => {
                return await hre.common.getLogs(contract, "RandomWordsRequested");
            }, {
                onError: (e) => {
                    console.error("There was an error while running this method");
                    console.error(e);
                },
                onSuccess: (data) => {
                    console.log(`Requests: ${data.length || 'no'} elements`);
                    data.forEach(({args: {requestId}}) => {
                        console.log("Request id:", requestId);
                    })
                }
            }, [], {}
        ).asTask(
            "chainlink:vrf:list-requests",
            "Lists the requests from a VRF coordinator V2 / V2.5 contract"
        );

        new hre.methodPrompts.ContractMethodPrompt(
            "send", "fulfillRandomWords", {
                onError: (e) => {
                    console.error("There was an error while running this method");
                    console.error(e);
                },
                onSuccess: (tx) => {
                    console.log("tx:", tx);
                }
            }, [
                {
                    name: "requestId",
                    description: "The id of the request to fulfill",
                    message: "Choose the id of the request to fulfill",
                    argumentType: "uint256"
                },
                {
                    name: "consumerAddress",
                    description: "The related consumer contract (it MUST manually match for this mock!)",
                    message: "Choose one of your contract artifacts (must be a VRFConsumer V2 / V2Plus contract)",
                    argumentType: "contract"
                }
            ], {}
        ).asTask(
            "chainlink:vrf:fulfill-random-words",
            "Fulfills a random words request in a VRF coordinator V2 / V2.5 MOCK contract"
        );
    } else {
        hre.blueprints.registerBlueprint(
            "chainlink:vrf:consumer-deployment", "VRFConsumerV2Plus", "A Chainlink VRFConsumerV2Plus deployment module to be used in a remote network",
            path.resolve(baseDir, "ignition-modules", "VRFConsumerV2Plus.NonLocal.js.template"), "ignition-module", [
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

        new hre.methodPrompts.ContractMethodPrompt(
            "send", "fundSubscription", {
                onError: (e) => {
                    console.error("There was an error while running this method");
                    console.error(e);
                },
                onSuccess: (tx) => {
                    console.log("tx:", tx);
                }
            }, [
                {
                    name: "subscriptionId",
                    description: "The id of the subscription to fund (with LINK)",
                    message: "Choose the id of the subscription to fund (with LINK)",
                    argumentType: "uint256"
                },
                {
                    name: "amount",
                    description: "The amount to FUND, expressed in LINK fractions",
                    message: "Choose the amount to FUND (in fractions - 1e18 means 1 LINK)",
                    argumentType: "uint256"
                }
            ], {}
        ).asTask(
            "chainlink:vrf:fund-subscription",
            "Invokes fundSubscription on a mock VRF coordinator 2.5 contract, incrementing the LINK balance"
        );

        new hre.methodPrompts.ContractMethodPrompt(
            "send", "fundSubscriptionWithNative", {
                onError: (e) => {
                    console.error("There was an error while running this method");
                    console.error(e);
                },
                onSuccess: (tx) => {
                    console.log("tx:", tx);
                }
            }, [
                {
                    name: "subscriptionId",
                    description: "The id of the subscription to fund (with LINK)",
                    message: "Choose the id of the subscription to fund (with LINK)",
                    argumentType: "uint256"
                }
            ], {
                value: {onAbsent: "prompt"}
            }
        ).asTask(
            "chainlink:vrf:fund-subscription-with-native",
            "Invokes fundSubscription on a mock VRF coordinator 2.5 contract, incrementing the native balance"
        );
    }

    // TODO:
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

/**
scope_
    .task("fulfill-random-words")
    .setDescription("In a MOCK of a Chainlink VRF (2 or 2.5) contract, fulfills a random words request")
    .addPositionalParam("contract", "The address of the contract")
    .setAction(async ({ contract }, hre) => {
        const local = ["hardhat", "localhost"].includes(hre.network.name);
        if (!local) {
            console.error("This feature is only intended for hardhat/localhost networks");
            return;
        }

        // Invoke the fulfill method on the Chainlink mock.
        await hre.common.send(contract, "", [], {});
    });
*/