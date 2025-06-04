# hardhat-chainlink-common-blueprints : VRF
This is the documentation for the VRF feature of this package. The general documentation, which implies installing the
package and all the features, can be found [here](README.md).

VRF is a paid feature that requires knowledge of some elements of the Chainlink ecosystem. Chainlink training will not
be given in this documentation, but assumed.

## Setup
This setup assumes the relevant plugins are added as described in the [general docs'](README.md) setup section.

Also, since this is a paid feature, this requires a deeper knowledge on how to manage subscriptions for networks that
are not local. This might also require stuff like interacting with Chainlink's faucets in the test networks, while
actual money (e.g. ETH) in the main networks. While for local development no subscription is needed (since we'll be),
mainnets and testnets require the user following the usual procedure in the subscriptions management page, which can
be accessed [here](https://vrf.chain.link/), choosing the appropriate network in the top-left dropdown.

> Alternatively, we support a command to directly create a subscription from this command line, provided you don't
  want to use your MetaMask wallet for production/mainnet-related invocations.

VRF subscriptions can be funded with either LINK tokens or natively. The first step here is to create your subscription
there (this might require a small amount of gas). The next step is to fund your subscription. This can be done by
paying with either LINK or native currency and, again, it can be done in the same web interface or via provided means
by this package.

> The CLI alternative is, again, useful when users don't want to mix in-browser's MetaMask interaction with their
  production/mainnet deployments.

Since the setup is different between local and remote networks, this file will describe both approaches: ideally,
users should do the _local network_ setup and, then, the setup for remote networks, once of each remote network.

### Local networks: VRF 2.5 coordinator setup
While using local networks, we'll typically create a VRF coordinator mock contract. Creating a VRF coordinator mock
contract is done with the following command:

```shell
npx hardhat blueprint apply chainlink:vrf:coordinator-mock --network localhost
```

You can choose any name (e.g. VRFCoordinatorV2PlusMock) for the mock contract.

Among the required arguments, it will ask you to choose the base fee and gas price for the requests, and also whatever
current price should be used for the LINK token. These are just mock properties and can be left by default, since
attending random numbers generation requests will involve mock calls.

Then, the contract will be generated. Ideally, you wouldn't want to change the inner code but, perhaps, some of the
defined constants inside, in the worst case. The contract's content will look like this:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import "@chainlink/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.7.3/contracts/utils/structs/EnumerableSet.sol";

contract VRFCoordinatorV2PlusMock is VRFCoordinatorV2_5Mock {
    /**
     * WARNING: THIS CONTRACT IS TOO LARGE. Ensure you set up an optimization
     * setting in your hardhat.config.js. An example will look like this:
     *
     * module.exports = {
     *   solidity: {
     *     version: "0.8.24",
     *     settings: {
     *       optimizer: {
     *         enabled: true,
     *         runs: 200
     *       }
     *     }
     *   },
     *   ...
     * }
     */

    using EnumerableSet for EnumerableSet.UintSet;

    uint96 constant baseFee = 100000000000000000;
    uint96 constant gasPrice = 1000000000;
    int256 constant weiPerUnitLink = 7500000000000000;

    constructor() VRFCoordinatorV2_5Mock(baseFee, gasPrice, weiPerUnitLink) {}

    /**
     * Creates a deterministic subscription by a given id. This is useful
     * only locally, so tests and local environments can rely, conditionally,
     * on specific ids.
     */
    function createSubscription(uint256 subId) external nonReentrant {
        // Test the required subscription id.
        require(!s_subIds.contains(subId), "VRFCoordinatorV2PlusMock: That subscription id already exists");
        // Increment the subscription nonce counter.
        s_currentSubNonce += 1;
        // Initialize storage variables.
        address[] memory consumers = new address[](0);
        s_subscriptions[subId] = Subscription({balance: 0, nativeBalance: 0, reqCount: 0});
        s_subscriptionConfigs[subId] = SubscriptionConfig({
            owner: msg.sender,
            requestedOwner: address(0),
            consumers: consumers
        });
        // Update the s_subIds set, which tracks all subscription ids created in this contract.
        s_subIds.add(subId);

        emit SubscriptionCreated(subId, msg.sender);
    }
}
```

_Please note that the Solidity version may differ, and also pay attention to the optimization instructions that are
generated as comments inside this newly generated contract, since otherwise the compilation and deployment of this
contract will fail on mainnets and testnets._

Then, it's time to generate the ignition deployment file for it. There's a command:

```shell
npx hardhat compile # Otherwise, you may fail to see the new contract
npx hardhat blueprint apply chainlink:vrf:coordinator-deployment --network localhost
```

Among the existing contracts, ensure you select the just-created contract from the list, and continue (in this example
the name was VRFCoordinatorV2PlusMock). Have a name for the module to be VRFCoordinatorV2Plus, without "Mock". It's a
sensible choice for an ignition module, considering the name will be unified later. This said, the new module will be
called `VRFCoordinatorV2Plus.js` in the ignition/modules directory. Its contents will look like this:

```javascript
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("VRFCoordinatorV2Plus", (m) => {
  const contract = m.contract(
          "VRFCoordinatorV2PlusMock", []
  );

  // Edit this file to add many calls like this one but
  // for any amount of subscription ids. Remember that
  // this is a mock contract and should not be used in
  // test/live networks.
  //
  // In this example, this call creates a subscription
  // with number 12345. Create as many subscriptions
  // as needed.
  //
  // m.call(contract, "createSubscription(uint256)", [12345]);
  //
  // And also fund them properly:
  //
  // m.call(contract, "fundSubscription", [12345, "1000000000000000000000000"]);

  return { contract };
});
```

Considering that the constructor takes no arguments, this file is OK as is. Still, you can create fake subscriptions
in this file, to be created for that contract (_always keep in mind that the owner of the subscription will be the
account used for the execution of the ignition deployment operation_) and funded by this module for this new contract.
For example, following the comments in the file you can add the following subscriptions:

```javascript
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("VRFCoordinatorV2Plus", (m) => {
  const contract = m.contract(
          "VRFCoordinatorV2PlusMock", []
  );
  // YES: GIVE PROPER id: KEYS TO DISTINGUISH THE CALLS.
  // Ignition does not use any sort of hashing based on
  // arguments or incremental default naming but attempts
  // to give an id based on the invoked future (either a
  // contract's name or method).
  m.call(contract, "createSubscription(uint256)", [100001], {id: "createSubscription_1"});
  m.call(contract, "createSubscription(uint256)", [100002], {id: "createSubscription_2"});
  m.call(contract, "fundSubscription", [100001, "1000000000000000000000000"], {id: "fundSubscription_1"});
  m.call(contract, "fundSubscription", [100002, "1000000000000000000000000"], {id: "fundSubscription_2"});
  return { contract };
});
```

This creates two subscriptions with funds: 100001 and 100002, each with 1M LINK tokens in the subscription funds (which,
again, is a fake value since we're doing a local mock here).

The next step is to add this to the `deploy-everything` feature in the project. Something like this:

```shell
npx hardhat ignition deploy-everything add --module ./ignition/modules/VRFCoordinatorV2Plus.js
```

With this, the setup is done for the coordinator mock. The next step is to point to a coordinator on each live network,
be it a mainnet or testnet.

### Main and Test networks