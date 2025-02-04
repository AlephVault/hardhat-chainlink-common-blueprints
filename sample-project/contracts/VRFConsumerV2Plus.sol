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
    uint32 constant callbackGasLimit = 4000; // Default: 4000
    uint16 constant requestConfirmations = 3; // Default: 3
    uint32 constant numWords = 1; // Default: 1
    bool constant nativePayments = false; // Default: false

    // These are per-environment values: The subscription
    // id, the address of the coordinator of this random
    // number generator, and the hash of the gas lane to
    // use (it has to do with gas prices and priorities,
    // not with the gas quantity).
    uint256 private subscriptionId;
    address private vrfCoordinator;
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
        vrfCoordinator = _vrfCoordinator;
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
