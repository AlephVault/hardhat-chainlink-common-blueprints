const path = require("path");
const {extendEnvironment} = require("hardhat/config");

const baseDir = path.resolve(
    __dirname, "..", "data", "templates", "solidity"
);

extendEnvironment((hre) => {
    const solidityVersionArgument = {
        name: "SOLIDITY_VERSION",
        description: "The Solidity version for the new file",
        message: "Choose the solidity version for this file",
        argumentType: "solidity"
    };

    hre.blueprints.registerBlueprint(
        "chainlink:price-feed", "PriceFeedMock", "A Chainlink PriceFeed mock",
        path.resolve(baseDir, "PriceFeedMock.sol.template"), "solidity", [
            solidityVersionArgument
        ]
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
    new hre.methodPrompts.ContractMethodPrompt(
        "send", "setAnswer", {
            onError: (e) => {
                console.error("There was an error while running this method");
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
});

module.exports = {};