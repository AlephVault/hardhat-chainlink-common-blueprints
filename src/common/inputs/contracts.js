const { extendEnvironment } = require("hardhat/config");

extendEnvironment(hre => {
    /**
     * Lets the user pick an existing remote value
     * among the available contract addresses of a
     * given type. The remote value is typically a
     * contract address, but may be anything.
     */
    class GivenOrRemoteValueSelect extends hre.enquirerPlus.Enquirer.GivenOrSelect {
        constructor({loader, remoteValueType, choices, ...options}) {
            super({...options, choices: ["Loading..."]});
            this._remoteValueType = remoteValueType;
            this._loadChoices = async () => {
                const chainId = await hre.common.getChainId();
                return loader ? (await loader()).filter((e) => chainId === BigInt(e.chainId)).map((e) => {
                    return {name: e.address || e.value, message: e.name};
                }) : (choices || []).map(e => ({name: e.address, message: e.name}));
            }
        }

        async run() {
            this.choices = await this._loadChoices();
            if (this.choices.length === 0) {
                throw new Error(
                    `There are no available ${this._remoteValueType} for the current network - ` +
                    "ensure you select a network (e.g. Sepolia, Amoy, Ethereum, Polygon) " +
                    `that actually has the proper Chainlink-related ${this._remoteValueType} ` +
                    "available on it"
                );
            }
            this.options.choices = this.choices;
            return await super.run();
        }
    }

    hre.enquirerPlus.Enquirer.GivenOrRemoteValueSelect = GivenOrRemoteValueSelect;
    hre.enquirerPlus.utils.registerPromptClass(
        "plus:hardhat:given-or-remote-value-select", GivenOrRemoteValueSelect
    );
})

