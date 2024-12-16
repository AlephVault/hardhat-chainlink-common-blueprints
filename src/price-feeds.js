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
});

module.exports = {};