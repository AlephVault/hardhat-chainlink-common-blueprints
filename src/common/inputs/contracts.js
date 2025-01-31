const { extendEnvironment } = require("hardhat/config");

extendEnvironment(hre => {
    /**
     * Lets the user pick an existing contract address
     * among the available contract addresses of a
     * given type.
     */
    class GivenOrRemoteContractSelect extends hre.enquirerPlus.Enquirer.GivenOrSelect {
        constructor({loader, choices, ...options}) {
            super({...options, choices: ["Loading..."]});
            this._loadChoices = async () => {
                const chainId = await hre.common.getChainId();
                return loader ? (await loader()).filter((e) => chainId === e.chainId).map((e) => {
                    return {name: e.address, message: e.name};
                }) : (choices || []).map(e => ({name: e.address, message: e.name}));
            }
        }

        async run() {
            this.choices = await this._loadChoices();
            if (this.choices.length === 0) {
                throw new Error(
                    `There are no contracts of this type for the current network - ` +
                    "ensure you select a network (e.g. Sepolia, Amoy, Ethereum, Polygon) " +
                    "that actually has the proper Chainlink contracts deployed on it"
                );
            }
            this.options.choices = this.choices;
            return await super.run();
        }
    }

    hre.enquirerPlus.Enquirer.GivenOrRemoteContractSelect = GivenOrRemoteContractSelect;
    hre.enquirerPlus.utils.registerPromptClass(
        "plus:hardhat:given-or-remote-contract-select", GivenOrRemoteContractSelect
    );
})

