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
