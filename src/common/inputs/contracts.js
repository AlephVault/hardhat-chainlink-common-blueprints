const { extendEnvironment } = require("hardhat/config");

extendEnvironment(hre => {
    /**
     * Lets the user pick an existing contract address
     * among the available contract addresses of a
     * given type.
     */
    class GivenOrRemoteContractSelect extends hre.enquirerPlus.Enquirer.GivenOrSelect {
        constructor({hre, loader, ...options}) {
            super({...options, choices: ["Loading..."]});
            this._loadChoices = async () => {
                const chainId = await hre.common.getChainId();
                return await loader().filter((e) => chainId === e.chainId).map((e) => {
                    return {name: e.address, message: e.name};
                });
            }
        }

        async run() {
            this.choices = await this._loadChoices();
            this.options.choices = deployedContracts;
            return await super.run();
        }
    }

    hre.enquirerPlus.Enquirer.GivenOrRemoteContractSelect = GivenOrRemoteContractSelect;
    hre.enquirerPlus.utils.registerPromptClass(
        "plus:hardhat:given-or-remote-contract-select", GivenOrRemoteContractSelect
    );
})

