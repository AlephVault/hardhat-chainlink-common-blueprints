# hardhat-chainlink-common-blueprints : Data Feeds
This is the documentation for the Data Feeds feature of this package. The general documentation, which implies
installing the package and all the features, can be found [here](README.md).

Data Feeds, although a simple feature, requires knowledge of some elements of the Chainlink ecosystem. Chainlink
training will not be given in this documentation, but assumed.

## Setup
This setup assumes the relevant plugins are added as described in the [general docs'](README.md) setup section.

Price Feeds are read-only contracts, at least from the viewpoint of interacting with them from other contracts.

Since they're only intended to be read, the interaction is straightforward and involves one per-network contract
for each asset the user is interested in.

### Local networks
While using local networks, we'll typically create mock contracts. Creating a mock contract is done with the
following command:

```shell
npx hardhat blueprint apply chainlink:feed:feed-mock-contract
```

It will ask the name (let's assume MyContract) and solidity version to use, and ultimately generate a file like this:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract MyContract is AggregatorV3Interface {
    struct Entry {
        int256 answer;
        uint256 stamp;
    }

    uint8 private _decimals;
    uint256 private _version;
    string private _description;
    Entry[] private _entries;

    constructor(int256 _answer, string memory _descr, uint8 _decs, uint256 _v) {
        _description = _descr;
        _decimals = _decs;
        _version = _v;
        _entries.push(Entry({answer: _answer, stamp: block.timestamp}));
    }

    function decimals() external view override returns (uint8) {
        return _decimals;
    }

    function description() external view override returns (string memory) {
        return _description;
    }

    function version() external view override returns (uint256) {
        return _version;
    }

    function getRoundData(
        uint80 /*_roundId*/
    )
    public
    view
    override
    returns (uint80 roundId, int256 ans, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        if (roundId == 0 || roundId > _entries.length) {
            return (0, 0, 0, 0, 0);
        } else {
            Entry storage entry = _entries[roundId - 1];
            return (roundId, entry.answer, entry.stamp, entry.stamp, roundId);
        }
    }

    function latestRoundData()
    external
    view
    override
    returns (uint80 roundId, int256 ans, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        return getRoundData(uint80(_entries.length));
    }

    function setAnswer(int256 _answer) external {
        require(_entries.length < (1 << 80), "MyContract: rounds array is full");
        _entries.push(Entry({answer: _answer, stamp: block.timestamp}));
    }
}
```

_Please note that the Solidity version may differ._

Then, an ignition deployment module file should be generated. It can be done with the following command:

```shell
npx hardhat compile # Otherwise, you may fail to see the new contract.
npx hardhat blueprint apply new-contract-deployment-module
```

Among the existing contracts, MyContract (following this example) must be chosen. A module file will be
generated and look like this (let's assume this deployment is intended to mock the MATIC / USD pair, so
choose the name MaticUsd for it):

```javascript
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MaticUsd", (m) => {
    // You can pass parameters (e.g. "foo") to this module and attend
    // or capture them by using line like this one:
    //
    // (parameter keys must be valid alphanumeric strings, and parameter
    // values, both expected and default, must be json-serializable ones,
    // which can be numbers, boolean values, strings or null)
    //
    // const foo = m.getParameter("foo", "someValue");

    // This is a simple module which only deploys a contract. The result
    // of m.contract is a special value (not an actual contract nor its
    // address) that makes part of the ignition declarative paradigm: a
    // "future". Read more about ignition and futures in the official
    // documentation @ Hardhat's website.

    // The [] receives as many argument as your contract needs. Those
    // will be passed directly to the constructor.

    const contract = m.contract(
        "MyContract", []
    );

    // In this case, the result is a single object having a contract: key
    // which contains the future. When Ignition deployment is invoked and
    // retrieved via code, the result will be a single object having a
    // contract: key which contains a Contract instance (from `ethers` or
    // `viem` or whatever biding you're using for Ignition).

    // Feel free to edit this file as needed, but it's a good idea to keep
    // the object with the contract: key (you can freely add more keys) or
    // other tools based on this one might not work for your script.

    return { contract };
});
```

Change the parameters of `m.contract` to a sensible value, like `["100000000", "An awesome feed", 8, 1]`. This file
will be used for local networks only.

### Main and Test networks

Here, we'll leverage the power of existing data feeds (we don't want to use mocks here) in the appropriate
network. Since there can be many networks set up in a project, this setup will be needed more than once:

1. Ensure the network of interest is added to your hardhat project (you'll use a `--network your-network` argument).
2. Extract the mnemonic and/or private key(s) you'll work with, typically into environment variables.
3. Run the following command to create an ignition module to reference a per-network:

   ```shell
   npx hardhat blueprint apply chainlink:feed:feed-external-deployment --network your-network
   ```

4. Give it a name (let's assume MaticUsd2) and, from the list of feeds supported in your network, choose the one you
   want to reference. If this setup is run for multiple networks, ensure the name is not always MaticUsd2 but instead
   MaticUsd3, MaticUsd4, ... every time a different name.
5. You'll see your MaticUsd2 module in your ignition directory as well, with this content:

   ```javascript
   const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

   module.exports = buildModule("MaticUsd2", (m) => { // or: MaticUsd3, MaticUsd4...
       const contract = m.contractAt(
           // In my example, it's the Polygon Amoy address of MATIC / USD feed.
           "AggregatorV3Interface", "0x001382149eBa3441043c1c66972b4772963f5D43"
       );
   
       return { contract };
   });
   ```

6. Consider whether you need to repeat steps 1-5 for other networks you're interested in.

### Unified deployment

So far, you have a lot of new modules, one for each network. Rename all the internal module names (inside each file)
to a unified name (e.g. MaticUsd) and then rename all the files with the proper chain id. For example, assume you
have a local network, an entry for Polygon Mainnet (137) and an entry for Polygon Amoy (80002) and you generated the
files to be like this:

1. MaticUsd.js for the local mock.
2. MaticUsd2.js with the --network amoy parameter chosen (thus having the in-Amoy address of the MATIC / USD feed).
3. MaticUsd3.js with the --network matic parameter chosen (this having the in-mainnet one).

The new names must become, respecting the order: MaticUsd.js, MaticUsd-80002.js and MaticUsd-137.js respectively.

Finally, run this command to add this to the unified deployment pipeline ("Deploy Everything"):

```shell
npx hardhat ignition deploy-everything add --module ignition/modules/MaticUsd.js
```

This will add the module to the pipeline and the correct one will be executed depending on the network (if a new
network is added to the hardhat config file, the mock will be executed instead! ensure to repeat the steps to add
an ignition module or create it manually by copying / pasting / renaming and choosing the appropriate address
from the official Chainlink documentation).

## Available Commands

This said, there are some commands that are available for Feeds-related features:

1. You can clean the cache of available feeds (this feature is only available for Feeds in this package).
   This is needed if the list is outdated, but is a seldom used command:

   ```shell
   npx hardhat invoke chainlink:price-feed:invalidate-cache
   ```
   
2. To return the latest round data from an ignition-deployed contract, execute this command:

   ```shell
   # Use --network amoy or whatever network you want to get
   # the data from, and then choose a contract deployed on
   # that network.
   npx hardhat invoke chainlink:price-feed:latest-round-data
   ```
   
3. To return data from a specific round from an ignition-deployed contract, execute this command:

   ```shell
   # Use --network amoy or whatever network you want to get
   # the data from, and then choose a contract deployed on
   # that network.
   #
   # Also, specify the round number you're interested in.
   npx hardhat invoke chainlink:price-feed:get-round-data
   ```
   
4. This command makes only sense in localhost / hardhat network, since it involves interacting
   with a mock contract, so it's not available in other networks. Its intention is to set the
   current value for a feed:

   ```shell
   # Don't use any --network xxx here.
   #
   # Choose a contract deployed on the localhost network.
   #
   # Also, tell the new value the feed must have.
   npx hardhat invoke chainlink:price-feed:set-answer
   ```
   
   With this, the feed mock will have a new value.

## Conclusion

With this in mind, you should be able to properly deploy and interact with feed contracts in
your other contracts and / or test files as with other contracts in a seamless way (e.g. when
interacting with feeds to apply conversion rates when selling products).