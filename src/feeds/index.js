const path = require("path");
const { extendEnvironment } = require("hardhat/config");
const { getFeedContracts, invalidateFeedContracts } = require("./utils/download");

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

    new hre.methodPrompts.CustomPrompt(
        function([]) {
            invalidateFeedContracts();
        }, {
            onError: (e) => {
                console.error("There was an error while invalidating the cache (perhaps it does not exist)");
            },
            onSuccess: (tx) => {
                console.log("The cache was successfully invalidated");
            }
        }, [], {}
    ).asTask(
        "chainlink:price-feed:invalidate-cache",
        "Invalidates the cache of AggregatorV3Interface / PriceFeed live/test deployed contracts",
        {onlyExplicitTxOptions: true}
    );
    new hre.methodPrompts.ContractMethodPrompt(
        "call", "latestRoundData", {
            onError: (e) => {
                console.error("There was an error while running this method");
                console.error(e);
            },
            onSuccess: (value) => {
                console.log("Answer:", value);
            }
        }, [], {}
    ).asTask(
        "chainlink:price-feed:latest-round-data",
        "Invokes latestRoundData() on an AggregatorV3Interface-implementing (i.e. Price Feed) contract"
    );
    new hre.methodPrompts.ContractMethodPrompt(
        "call", "getRoundData", {
            onError: (e) => {
                console.error("There was an error while running this method");
                console.error(e);
            },
            onSuccess: (value) => {
                console.log("Answer:", value);
            }
        }, [{
            name: "roundId",
            description: "The id of the round",
            message: "What's the round id?",
            argumentType: "uint80"
        }], {}
    ).asTask(
        "chainlink:price-feed:get-round-data",
        "Invokes getRoundData(uint80) on an AggregatorV3Interface-implementing (i.e. Price Feed) contract"
    );

    if (["hardhat", "localhost"].includes(hre.network.name)) {
        hre.blueprints.registerBlueprint(
            "chainlink:feed:mock", "PriceFeedMock",
            "A Chainlink PriceFeed mock contract to be used in the local network",
            path.resolve(baseDir, "solidity", "PriceFeedMock.sol.template"), "solidity", [
                solidityVersionArgument
            ]
        );
        new hre.methodPrompts.ContractMethodPrompt(
            "send", "setAnswer", {
                onError: (e) => {
                    console.error("There was an error while running this method (probably not a PriceFeed mock)");
                    console.error(e);
                },
                onSuccess: (tx) => {
                    console.log("Answer set successfully. Transaction is:", tx);
                }
            }, [{
                name: "answer",
                description: "The value to set",
                message: "What's the new value to set?",
                argumentType: "int256"
            }], {}
        ).asTask(
            "chainlink:price-feed:set-answer",
            "Invokes setAnswer(int256) on an AggregatorV3Interface-implementing (i.e. Price Feed) contract"
        );
    } else {
        hre.blueprints.registerBlueprint(
            "chainlink:feed:deployment", "RemoteAggregatorV3", "An ignition module referencing an existing ChainLink AggregatorV3Interface (PriceFeed or not)",
            path.resolve(baseDir, "ignition-modules", "RemoteAggregatorV3.js.template"), "ignition-module", [
                {
                    name: "CONTRACT_NAME",
                    description: "The contract to make the deployment for",
                    message: "Choose one of your contract artifacts (it must be an AggregatorV3 stub contract)",
                    argumentType: "contract"
                },
                {
                    name: "CONTRACT_ADDRESS",
                    description: "The address of an existing feed contract",
                    message: "Choose the existing feed contract for this network",
                    argumentType: {
                        type: "plus:hardhat:given-or-remote-value-select",
                        remoteValueType: "Feed contracts",
                        loader: () => getFeedContracts()
                    }
                }
            ]
        );
        hre.blueprints.registerBlueprint(
            "chainlink:feed:stub", "RemoteAggregatorV3Stub",
            "A Chainlink Aggregator V3 stub contract to be referenced in a remote network",
            path.resolve(baseDir, "solidity", "RemoteAggregatorV3Stub.sol.template"), "solidity", [
                solidityVersionArgument
            ]
        );
    }
});

module.exports = {};