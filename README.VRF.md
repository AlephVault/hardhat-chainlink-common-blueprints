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

### Local networks: VRF 2.5 consumer setup
These are the instructions to set up a consumer contract, and should be followed separately _for each consumer contract
to be created in the user's ecosystem_. In particular, these instructions are meant for the local network only, and
separate instructions must be done _for each remote network_ (and yes: _for each consumer contract_, for a total of NxM
instructions procedures executed by the user).

The first step is to create the consumer contract. Since it's part of the user's logic, this step will be executed once
and here (NOT again in the remote networks). The command to generate the consumer contract is this:

```shell
npx hardhat blueprint apply chainlink:vrf:consumer
```

This command will ask you for many arguments like:

- Maximum intended gas per VRF callback.
- Number of block confirmations the VRF should wait for before satisfying our request (intended to make sure, the best
  it can, to ensure the current transaction will remain and not be replaced due to a consensus conflict in the network
  after 3 blocks).
- The amount of random numbers (min. 1) that must be generated per request.
- Whether this contract will use native payments or LINK payments (default).

Don't worry if you fill these arguments wrong: you can still modify the generated contract's code. It will look like
this (provided the name is set by default, as in this example):

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/**
 * This contract is a VRF consumer. This is a default implementation that
 * can be changed later at user's please (as long as the call to
 * `requestRandomWords` is done, it will work and the user can tune it
 * to have many call implementations).
 */
contract VRFConsumerV2Plus is VRFConsumerBaseV2Plus {
    // Constants related to the code & consumption model
    // of our VRF Consumer contract. You are free to move
    // them to actual variables and arguments if you need
    // to make them per-network, but ensure you respect
    // the identifier names in the process.
    uint32 constant callbackGasLimit = 1000000; // Default: 1000000
    uint16 constant requestConfirmations = 3; // Default: 3
    uint32 constant numWords = 1; // Default: 1
    bool constant nativePayments = false; // Default: false

    // These are per-environment values: The subscription
    // id and the hash of the gas lane to use (it has to do
    // with gas prices and priorities, not with the gas
    // quantity).
    uint256 private subscriptionId;
    bytes32 private keyHash;

    /**
     * The status of the request.
     */
    enum RequestStatus { Invalid, Pending, Completed }

    /**
     * This event is dapp-specific to tell that the request has
     * started. Users should listen for this event and do any
     * processing, typically understanding that the dapp will
     * be properly updated.
     */
    // Modify this event as much as you want, but always keeping
    // in mind that you can have up to 3 indexed arguments and
    // typically you might like requestId to be one of them.
    event RequestStarted(uint256 indexed requestId);

    /**
     * This event is dapp-specific to tell that the request has
     * completed. Users should listen for this event and do any
     * processing, typically understanding that the dapp will
     * be properly updated.
     */
    // Modify this event as much as you want, but always keeping
    // in mind that you can have up to 3 indexed arguments and
    // typically you might like requestId to be one of them.
    event RequestCompleted(uint256 indexed requestId);

    /**
     * The request, being tracked for completion. This request
     * will hold dapp-logic related to the launched request (an
     * example: who launched the request and some extra context
     * to be used in the words-fulfillment handling).
     */
    struct Request {
        /**
         * The status of the request. Check against Invalid to detect whether
         * a given request ID was never issued.
         */
        RequestStatus status;
        // Add more variables you deem useful here.
    }

    /**
     * The in-progress and fulfilled requests.
     */
    mapping(uint256 => Request) private requests;

    // Add more parameters to this constructor when needed.
    constructor(uint256 _subscriptionId, address _vrfCoordinator, bytes32 _keyHash)
        VRFConsumerBaseV2Plus(_vrfCoordinator)
    {
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
    }

    /**
     * This internal function is the responsible of requiring
     * the random numbers to the VRF service.
     */
    // It's name can be changed, and also the required arguments
    // or even the output arguments (return values), visibility
    // and modifiers. The important part is that this function
    // is the entry point to request random numbers and that it
    // must be modified enough so it is not freely invokable by
    // external users or contracts, but by certain rules instead
    // (e.g. as part of a game-related request).
    function triggerDAPPRequest() internal {
        // Add any prior logic here.

        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                // Adding extraArgs is optional.
                extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({
                    // One of the allowed extraArgs is to tell whether
                    // we will use nativePayments (true) or LINK payments
                    // (false) in our subscription.
                    nativePayment: nativePayments
                }))
            })
        );

        // Storing the request is mandatory. It will not raise any error
        // if not done, but the request will be lost and it will become
        // wasted money and, of course, it is a bug.
        // Custom data is allowed and typically recommended depending on
        // the dapp's logic.
        requests[requestId] = Request({status: RequestStatus.Pending});

        // Emit the custom event, perhaps adding more data. This is
        // optional but a typically useful use case.
        emit RequestStarted(requestId);
    }

    /**
     * Attends any incoming response for the issued requests.
     */
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        // Get any randomWords[0] to randomWords[numWords - 1].
        // They ARE random numbers (you're charged for any number
        // generated this way, as part of the whole execution).

        // Fulfill the request. It is guaranteed that the record
        // will exist, as long as it is properly stored on launch.
        Request storage request = requests[requestId];
        request.status = RequestStatus.Completed;
        // Fulfilling will involve setting more data in the request.

        // Emit the custom event, perhaps adding more data. This is
        // optional but a typically useful use case.
        emit RequestCompleted(requestId);
    }
}
```

_Please note that the Solidity version may differ._

After this boilerplate code is generated, the file should be modified for the user's needs.

### Main and Test networks