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

With this, the setup is done for the coordinator mock. The next step is to create a consumer for this coordinator.

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
So, let's make a sample adjustment for this tutorial: to just track the requests and get
the generated random values:

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
        // The random value.
        uint256 value;
    }

    /**
     * The in-progress and fulfilled requests.
     */
    mapping(uint256 => Request) private requests;

    /**
     * Requests by id. Retrieving 0 stands for invalid name.
     */
    mapping(string => uint256) private requestIdByName;

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
    function triggerDAPPRequest() internal returns (uint256) {
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
        requests[requestId] = Request({status: RequestStatus.Pending, value: 0});

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
        request.value = randomWords[0];
        // Fulfilling will involve setting more data in the request.

        // Emit the custom event, perhaps adding more data. This is
        // optional but a typically useful use case.
        emit RequestCompleted(requestId);
        
        return requestId;
    }

    /**
     * Returns a single request.
     */
    function getRequest(string memory name) external view returns (Request memory) {
        uint256 requestId = requestIdByName[name];
        require(requestId != 0, "Invalid request");
        return requests[requestId];
    }


    /**
     * Performs a request.
     */
    function launchRequest(string memory name) external {
        // Yes, it's a bad practice to revert in a view like this.
        // Still, consider this just an example.
        require(requestIdByName[name] == 0, "Request name already used");
        requestIdByName[name] = triggerDAPPRequest();
    }
}
```

The new sample code does:

1. Update the request structure to have the returned value (for when it's `RequestStatus.Completed`).
2. Start the request with value=0. Only 1 random word is requested. Return the id of the generated request.
3. When the value gets completed, sets the value with the first random word.
4. A method to return data of a request by a chosen name.
5. A method to launch the request by a chosen name.

Then, it's time to create the deployment file for this contract. It's done with the following command:

```shell
npx hardhat compile # Otherwise, you may fail to see the new contract
npx hardhat blueprint apply chainlink:vrf:consumer-deployment
```

Take as an example the name `VRFConsumerV2Plus` for the module name, and choose the just-created `VRFConsumerV2Plus`
contract (following the same example). Also, since this is a _local_ deployment file, pick a subscription id from
those that were created in the coordinator's (local) deployment module file. Following this example, `100001` or
`100002` will be OK.

Finally, the _local_ module file for the coordinator must be picked (it will be used as a dependency in the new module
being generated).

Again: if you make any mistake here, you can just dive into the generated code and manually fix what you need. The code
will look like this:

```javascript
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const path = require("path");
let relativePath = path.relative(
        __dirname, path.resolve(
                require("hardhat").config.paths.root, "ignition", "modules",
                "VRFCoordinatorV2Plus.js".replaceAll("\\", "/")
        )
);
if (!relativePath.startsWith(".")) relativePath = "./" + relativePath;
const vrfCoordinatorModule = require(relativePath);

module.exports = buildModule("VRFConsumerV2Plus", (m) => {
  // You can pass parameters (e.g. "foo") to this module and attend
  // or capture them by using line like this one:
  //
  // (parameter keys must be valid alphanumeric strings, and parameter
  // values, both expected and default, must be json-serializable ones,
  // which can be numbers, boolean values, strings or null)
  //
  // const foo = m.getParameter("foo", "someValue");

  // Since this deployment is intended to be run in the LOCAL network,
  // the keyHash doesn't matter. The coordinator mock does not make
  // use of this value since the gas price is only meaningful in live
  // or test networks to track priority of transactions, but it is not
  // used in local networks, so this value can be arbitrary. The mock
  // will not enforce it. But, yes, it must be a 0x-prefixed string
  // with 64 hex. characters.
  const keyHash = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  // It is assumed that this subscription id is known beforehand and
  // specified in the custom-mock method createSubscription(uint256),
  // which is not part of Chainlink's mock but the mock generated by
  // this module. This is intended for subscription ids are stable in
  // the local test environment. So somewhere, in another module, you
  // must have a .createSubscription(100001) call to the
  // (local) coordinator mock. This is only possible because this
  // module must only be used in LOCAL environments (take a look at
  // the deploy-everything package to understand how). Non-local
  // environments should use the non-local variant blueprint, which
  // expects the subscription id to be created by regular Chainlink
  // methods and well-known web portals.
  const subscriptionId = "100001";

  // This is a simple module which only deploys a contract. The result
  // of m.contract is a special value (not an actual contract nor its
  // address) that makes part of the ignition declarative paradigm: a
  // "future". Read more about ignition and futures in the official
  // documentation @ Hardhat's website.

  // The [] receives as many argument as your contract needs. Those
  // will be passed directly to the constructor.

  const vrfCoordinator = m.useModule(vrfCoordinatorModule).contract;
  const contract = m.contract(
          "VRFConsumerV2Plus", [subscriptionId, vrfCoordinator, keyHash]
  );
  m.call(vrfCoordinator, "addConsumer", [subscriptionId, contract]);

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

The next step is to add this to the `deploy-everything` feature in the project. Something like this:

```shell
npx hardhat ignition deploy-everything add --module ./ignition/modules/VRFConsumerV2Plus.js
```

_Executing the `add` subcommand is only done once, since remote setups will be automatically added to deploy-everything
as well._

### Local networks: VRF 2.5 consumer setup
The consumer is ready. Now, it's time to test everything locally. We'll do the following steps:

1. Mount the local node:

   ```shell
   npx hardhat node
   ```
 
2. Deploy everything to localhost:

   ```shell
   npx hardhat ignition deploy-everything run --network localhost
   ```

3. Then, open a console and load that contract:

   ```shell
   npx hardhat console --network localhost
   ```
   
4. In the console, start with commands:

   ```shell
   # Get the consumer contract and launch a request.
   const consumer = await hre.ignition.getDeployedContract("VRFConsumerV2Plus#VRFConsumerV2Plus")
   await consumer.launchRequest("foo")
   ```

5. The request will be _pending_ for, in the local network, nothing resolves that request _yet_.

   ```javascript
   // Try getting the request.
   await consumer.getRequest("foo")  // will return [1n, 0n], meaning it is pending.
   ```
   
6. Now it's time to list the current requests pending in the _coordinator_ contract:

   ```shell
   npx hardhat invoke chainlink:vrf:list-requests --network localhost
   ```
   
   Since this is a mock, it will return a single request number only: `1n`. Keep this number in mind.
   **NOTES**: Although this approach is annoying, don't worry! You'll only learn this for informational purposes, but
              there is a better approach to do this in localhost. Just follow this example for a while to learn what's
              going on.

7. Now, take that `1n` and ensure it's fulfilled by the mock:

   ```shell
   npx hardhat invoke chainlink:vrf:fulfill-random-words --network localhost
   ```
   
   Choose the mock contract, the request id `1`, and the consumer contract (in _that_ order).
   If everything works OK, the request will be satisfied.

8. Finally, try again getting the current request in the console:

   ```javascript
   // Try getting the request.
   await consumer.getRequest("foo")  // will return [2n, ...some big random number...].
   // In this example case, 2n means "completed".
   ```

**For a better approach** consider actually running a special worker. While playing in another console (just to start
fresh, but otherwise you can skip the steps 1 - 4 of these instructions and continue in the same console you were
playing), do the following steps:

5. First, run this worker (if you don't, then you're in the previous case where you have to do the manual steps):

   ```shell
   npx hardhat invoke chainlink:vrf:fulfill-random-words-worker --network localhost
   ```
   
   It will tell you to choose a contract (choose the VRF V2.5 Mock contract) and will start an endless loop (when you
   want to close it, just use the classic Ctrl+C hotkey). In this loop, only **new** requests will be processed by the
   worker, while previous requests (i.e. those triggered before while the worker is not running) will be processed with
   the previous, manual, approach.

   Please note: **this mock resolves the request immediately, ignoring the specified `confirmations` argument**.

6. After this is done, go back to the console and see how they're immediately attended. Do this by trying:

   ```javascript
   await consumer.launchRequest("bar")
   // Wait some time and check the worker terminal you're running. You'll see a line like this:
   //     Received request id: 2n from sender: 0xSomeEthAddress
   // Then, come back and try getting the request:
   await consumer.getRequest("bar")
   // And now you should see a result!!!! (something like Result(2) [2n, ...big number...])
   ```

If you managed to get here, then **congratulations**!!! You've properly set up your consumer contract!!!

Now, consider something: this was just an example. Tune the logic to your needs.

**NOTES**: If, for some reason, the request is never fulfilled, it's probably due to a revert in the fulfillment logic.
The most common causes are:

1. A bug in your logic. Debug it thoroughly as always.
2. If no apparent bug, then the reason is **gas**. Ensure the gas you specify in the consumer (for a request) is big
   enough. By default, the consumer template suggests 1000000 of gas.

### Main and Test networks
Now, this part is not as easy. The most important thing you need here is a funded Chainlink VRF subscription.

First, we'll cover referencing an external VRF Coordinator, according to whatever network are you focusing now (e.g.
a testnet like Amoy, or a mainnet like Polygon). In order to reference an external contract with Hardhat Ignition, the
contract must be developed and compiled first (i.e. a non-abstract artifact must exist). We'll solve this issue by
creating a _stub_. A _stub_ is like a mock (and, in fact, you can omit this and just use the same mock, but stubs are
distinct for the sake of clarity) but has no implementation at all (all the methods are empty or return empty values).

In order to generate the mock, you can try this command (for some non-localhost, non-hardhat, network):

```shell
npx hardhat blueprint apply chainlink:vrf:coordinator-stub --network some-network
```

It will ask the name of the contract (I left it by default: RemoteVRFCoordinatorV2PlusStub) and generate its contents
like this:

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";

/**
 * This is not an actual contract implementation but a stub, useful to refer
 * remotely (externally) deployed contracts satisfying RemoteVRFCoordinatorV2PlusStub.
 */
contract RemoteVRFCoordinatorV2PlusStub is IVRFCoordinatorV2Plus {
    event SubscriptionCreated(uint256 indexed subId, address owner);

    constructor(){}

    function addConsumer(uint256 subId, address consumer) external {}

    function removeConsumer(uint256 subId, address consumer) external {}

    function cancelSubscription(uint256 subId, address to) external {}

    function acceptSubscriptionOwnerTransfer(uint256 subId) external {}

    function requestSubscriptionOwnerTransfer(uint256 subId, address newOwner) external {}

    function createSubscription() external returns (uint256) { return 0; }

    function getSubscription(
        uint256 subId
    ) external view
    returns (uint96 balance, uint96 nativeBalance, uint64 reqCount, address owner, address[] memory consumers) {
        return (0, 0, 0, address(0), new address[](0));
    }

    function pendingRequestExists(uint256 subId) external view returns (bool) { return false; }

    function getActiveSubscriptionIds(uint256 startIndex, uint256 maxCount) external view returns (uint256[] memory) {
        return new uint256[](0);
    }

    function fundSubscriptionWithNative(uint256 subId) external payable {}

    function requestRandomWords(VRFV2PlusClient.RandomWordsRequest calldata req) external returns (uint256) {
        return 0;
    }
}
```

_Please note that the Solidity version may differ._

This file does nothing, but it will not be used in localhost.

Now, it's time to generate a deployment of this file to the actual (same) network. In fact, the deployment file will
just _reference_ an existing contract, instead of deploying a new contract (we want to use Chainlink services, after
all). The command looks like this:

```shell
npx hardhat compile # Otherwise, you may fail to see the new contract
# Ensure it is the same network and replace XXXXX with the chain ID of that network
npx hardhat blueprint apply chainlink:vrf:coordinator-deployment --network some-network --output-file VRFCoordinatorV2Plus-XXXXX
```

**IMPORTANT**: Following the example in the local network, and in order to make this work with `deploy-everything`,
ensure the name you give to the module is VRFCoordinatorV2Plus, while the name of the file matches the same pattern,
VRFCoordinatorV2Plus-XXXXX. This name is not mandatory, but it is strongly advised that the names given for the module
in all the networks match in file name with the said pattern, and match exactly internally (i.e. the name given to the
`buildModule` function). So yes, use the name you want **but always a consistently matching name**.

The contents of the file will look like this:

```javascript
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("VRFCoordinatorV2Plus", (m) => {
    const contract = m.contractAt(
        "RemoteVRFCoordinatorV2PlusStub", "0xTheVRFCoordinatorAddressForTheNetwork"
    );

    return { contract };
});
```

And, since the reference is already added to the `deploy-everything` feature (since the module file name matches the
same pattern of the _bare_ file used for localhost network), the module is already added to the list. However, when
you try to run the following command:

```shell
# Ensure it is the same network
npx hardhat ignition deploy-everything run --network some-network
```

You'll notice an error. This happens because _we didn't define the Consumer contract's deployment module yet_, and it
is trying to use the existing (localhost-only) module. The big problem here is that the existing consumer module is
trying to deploy the *mock* Coordinator contract, and then the consumer contract, in the live network, which causes
errors, mainly because we don't have, so far, any private key set.

By the end of this section, I'll explain how to set up a private key, a subscription, and LINK funds for it (read more
Chainlink documentation to know how to fund a subscription with native currency vs. fund with LINK currency). If you
already know good development practices (regarding key management) and how to create and manage subscriptions, then you
can skip reading the appendix. Otherwise, follow the appendix. By the end you must have:

1. A private key, properly setup in your project, which will own...
2. ...a subscription id, being it one...
3. ...already funded (LINK, in this case and related to the code of the consumer we've created).

(seriously, by this point I assume you know how to manage your keys and how subscriptions work - follow Chainlink
courses to completion if necessary about these topics)

So let's generate the consumer _deployment module_, this time for this new, non-local, network:

```shell
# Always the same network and use the matching chain id for XXXXX as you did in the consumer deployment
# In this case, we'll respect the VRFConsumerV2Plus convention since it was the same name in the localhost
# deployment - this, to make deploy-everything work out of the box for this network as well.
npx hardhat blueprint apply chainlink:vrf:consumer-deployment --network some-network --output-file VRFConsumerV2Plus-XXXXX
```

The consumer deployment file will look like this:

```javascript
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const path = require("path");
let relativePath = path.relative(
    __dirname, path.resolve(
        require("hardhat").config.paths.root, "ignition", "modules",
        "VRFCoordinatorV2Plus-XXXXX.js".replaceAll("\\", "/")
    )
);
if (!relativePath.startsWith(".")) relativePath = "./" + relativePath;
const vrfCoordinatorModule = require(relativePath);

module.exports = buildModule("VRFConsumerV2Plus", (m) => {
    // You can pass parameters (e.g. "foo") to this module and attend
    // or capture them by using line like this one:
    //
    // (parameter keys must be valid alphanumeric strings, and parameter
    // values, both expected and default, must be json-serializable ones,
    // which can be numbers, boolean values, strings or null)
    //
    // const foo = m.getParameter("foo", "someValue");
    //
    // This is needed for the consumer:
    const keyHash = "0x...some key hash...";
    // Since this module is meant to be executed for non-local networks,
    // the subscription id must be populated externally. In this case, it
    // will be done by populating a parameters file like this example:
    //
    // {
    //     ...,
    //     "VRFConsumerV2Plus": {
    //         ...
    //         "subscriptionId": "128713872847"
    //         ...
    //     },
    //     ...
    // }
    //
    // where "128713872847" is just a big integer being the subscription id
    // you retrieved in the Chainlink interface.
    // Since the test networks eventually reset, that parameters file should
    // be IGNORED in git (via .gitignore) for the test network it related to,
    // and a different one should be used for corresponding live networks (this
    // also implies there must typically be a different parameters file for
    // each network, while still adding to .gitignore all the files that
    // are for local networks - each having at minimum a different value in
    // "subscriptionId" for module "VRFConsumerV2Plus").
    const subscriptionId = m.getParameter("subscriptionId", "0");

    // This is a simple module which only deploys a contract. The result
    // of m.contract is a special value (not an actual contract nor its
    // address) that makes part of the ignition declarative paradigm: a
    // "future". Read more about ignition and futures in the official
    // documentation @ Hardhat's website.

    // The [] receives as many argument as your contract needs. Those
    // will be passed directly to the constructor.

    const vrfCoordinator = m.useModule(vrfCoordinatorModule).contract;
    const contract = m.contract(
        "VRFConsumerV2Plus", [subscriptionId, vrfCoordinator, keyHash]
    );
    m.call(vrfCoordinator, "addConsumer", [subscriptionId, contract]);

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

Some things are important to consider:

1. Following the example, leave the name as VRFConsumerV2Plus for the said reasons above.
2. Pick the same consumer contract we're already using: VRFConsumerV2Plus.
3. Choose the name of an argument to be used. This argument will be used among Hardhat Ignition arguments when
   deploying. for example, if you choose `subscriptionId`, then on deployment you will send arguments like this:

   ```shell
   npx hardhat ignition deploy-everything run --network some-network --parameters="./path/to/parameters.json"
   ```
   
   Being such file's contents for this example: `{"VRFConsumerV2Plus": {"subscriptionId": 12345}}` (where `12345` is
   a placeholder - use your actual subscription number). Typically, this file would be _ignored_ in the repository.
4. Choose a gas lane. Gas lanes determine the price you (the subscription owner) pay for each gas unit in these calls.
   Don't worry: if you need a dynamic logic you can modify the consumer contract, but this logic takes into account a
   specific logic for the contract and its arguments. Feel free to modify your files accordingly. This wizard follows
   a default suggested structure.
5. Finally, choose which deployment file to take a dependency (one with the coordinator defined). We'll pick our
   VRFCoordinatorV2Plus-XXXXX deployment file (yes: for the same network).

Considering that you have proper key being set, gas being set, and so, then your command should work now:

```shell
npx hardhat ignition deploy-everything run --network some-network --parameters ./ignition/some-network-parameters.json
```

With this, the consumer will be set up. Now, take the address of the contract (explore the deployed_addresses.json
file among your ignition files or use `hardhat ignition status chain-XXXXX`) and set it up in your subscription as
a consumer.

The next sanity check is to see what happens in console, as in the very first interaction, but in the new network:

```shell
npx hardhat console --network some-network
```

And run the commands:

```javascript
const consumer = await hre.ignition.getDeployedContract("VRFConsumerV2Plus#VRFConsumerV2Plus")
await consumer.launchRequest("foo")
```

With this very dumb logic, if you didn't mess with gas settings, and you have enough funds, then your transaction will
work. For example, you might want to try the `getRequest` (remember: this is a SAMPLE method in this SAMPLE contract!)
a few times until the oracle answers:

```javascript
await consumer.getRequest("foo");
// Result(2) [ 1n, 0n ]
await consumer.getRequest("foo");
// Result(2) [
//     2n,
//     2840642384784071225893875060801851730880388857613267824314824719894189555452n
// ]
```

With this, you can acknowledge your contract as working!

### Appendix 1: Configuring a private key

Hardhat version 2 is crappy regarding managing private keys. It is insecure and the reason behind Chainlink inventing
packages like `env-enc`. See their documentation for that matters.

But, for testing purposes, a way to set the private key comes like this:

1. Open your browser wallet. Pick an account of your choice.
2. Unlock the account's private key (in MetaMask this is done: dot-menu > Account Details > Show private key).
3. Use a setup like this in your hardhat config file (e.g. for amoy and polygon):

   ```javascript
   // ...

   module.exports = {
     // ...
     networks: {
       // ...
       amoy: {
         url: "https://polygon-amoy-bor-rpc.publicnode.com", // Replace with your provider
         accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
         chainId: 80002
       },
       polygon: {
         url: "https://polygon-rpc.com", // Replace with your provider
         accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
         chainId: 137 // Polygon Mainnet Chain ID
       }
     }
   };
   ```

Notice how the key comes from an environment variable. With this in mind, you can run all the commands against your
network (i.e. in this example, replacing `some-network` with `amoy` or `polygon`) if you first execute:

```shell
export PRIVATE_KEY=0x...thePrivateKeyYouTookFromYourWallet...
```

**BUT THIS IS DANGEROUS**. Ensure you don't leave this terminal open so much time, and that you clear your bash history
after issuing the relevant commands (this applies for when deploying to mainnet, but have also good practices in the
testnets). This means: close your terminal when done and, in another terminal, run `bash history -cw` or the equivalent.

Still, there are better practices to handle this, and Hardhat 3 promises to have better accounts management.

### Appendix 2: Creating and funding a subscription from code

This works only for the live networks, since the local network works differently (in particular because users deploy
local mocks instead of interacting with live contracts). There are commands you can run (again: they require a private
key to be set, as described in the previous section) for this purpose. Those commands are described later in this
document but essentially are:

1. Creating a subscription and funding it with native currency is supported for both local and live networks.
2. Getting a subscription's data is supported for both local and live networks.
3. Funding a subscription with LINK is only supported locally. For live networks, use the Chainlink VRF UI.
4. Adding consumer contracts to coordinator contracts is supported for both local and live networks.
   In fact, invoking the coordinator's methods for that purpose is also supported.
5. Listing random number requests, fulfilling a random number request, and launching the fulfilling automated
   worker is only supported locally.

With this in mind, users have more CLI options to manage subscriptions to some extent.

## Available Commands

These are commands to manage subscriptions, consumers, and random words fulfillments.

1. Listing all the subscriptions in a mock:

   ```shell
   npx hardhat invoke chainlink:vrf:list-subscriptions --network localhost
   ```

   This works in localhost only (i.e. mocks, not stubs), because the number of subscriptions is small.
   Choosing a deployed VRF coordinator 2.5 contract, this lists the existing subscriptions.

2. Get data from one subscription (this works live):

   ```shell
   npx hardhat invoke chainlink:vrf:get-subscription --network some-network
   ```

   Choosing a deployed VRF coordinator 2.5 contract, and a valid subscription id, returns the subscription's data.
   This data includes LINK funds, native funds, number of requests in that subscription, owner, and consumers.

3. Creating a subscription (this works live):

   ```shell
   npx hardhat invoke chainlink:vrf:create-subscription --network some-network
   ```
   
   Choosing a deployed VRF coordinator 2.5 contract, it creates a new subscription (and returns its id).

4. Funding a subscription (this works live for native):

   Funding a subscription is only supported with native currency, not with link, for remote networks.
   Future versions of this package will include support to fund with LINK. Fow now, use the UI to fund a VRF
   subscription with LINK. For native, the command is:

   ```shell
   # In this example, it is funded with 0.1 native currency.
   npx hardhat invoke chainlink:vrf:fund-subscription-with-native --value 100000000000000000 --network some-network
   ```
   
   The command takes a deployed VRF coordinator 2.5 contract, and a subscription id.
   
   Right now, for local networks, funding a subscription with fake LINK is supported:

   ```shell
   # Please note for this example application:
   # Will not take any custom private key into account since this
   # example has no accounts configuration override for localhost.
   npx hardhat invoke chainlink:vrf:fund-subscription --network localhost
   ```

   The command takes a deployed VRF coordinator 2.5 contract, a subscription id, and the amount (in wei) to fund.

5. Adding/removing a consumer to/from the coordinator (this works live):

   ```shell
   npx hardhat invoke chainlink:vrf:add-subscription-consumer --network some-network
   npx hardhat invoke chainlink:vrf:add-subscription-consumer --network some-network
   ```
   
   Both commands take a deployed VRF coordinator 2.5 contract, a subscription id, and a deployed VRF consumer 2.5
   contract. The first command registers the consumer and the second one unregisters the consumer.

6. Listing random fulfillment requests in a mock:

   ```shell
   npx hardhat invoke chainlink:vrf:list-requests --network localhost
   ```
   
   The command takes a deployed VRF coordinator 2.5 mock contract and lists all the requests sent to it.

7. Fulfilling a request in a mock:

   ```shell
   npx hardhat invoke chainlink:vrf:fulfill-random-words --network localhost
   ```
   
   The command takes a deployed VRF coordinator 2.5 mock contract and a request ID (listed from the previous
   list command) and fulfills with insecure (yet local-only) random numbers. It also takes which contract is
   the emitter of the request (pretty lame in my opinion but that's how the method is implemented in the mock
   contract provided by Chainlink).

8. Launch a random fulfillment worker to satisfy new requests into a mock:

   ```shell
   npx hardhat invoke chainlink:vrf:fulfill-random-words-worker --network localhost
   ```

   The command takes a deployed VRF coordinator 2.5 mock contract. This command is an endless loop that will
   only finish when users hit Ctrl+C.

## Conclusion
With this in mind, you should be able to interact with contracts in both local and development environments,
both by managing the subscriptions locally or via the Chainlink VRF UI. Future versions might include further
enhancements and support for more commands, but so far this should do it.