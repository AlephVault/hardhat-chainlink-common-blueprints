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