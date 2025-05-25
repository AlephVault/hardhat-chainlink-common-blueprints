// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";

contract RemoteVRFCoordinatorV2PlusStub is IVRFCoordinatorV2Plus {
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
