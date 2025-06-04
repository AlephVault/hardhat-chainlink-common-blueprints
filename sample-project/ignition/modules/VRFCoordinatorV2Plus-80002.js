const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("VRFCoordinatorV2Plus", (m) => {
  const contract = m.contractAt(
    "RemoteVRFCoordinatorV2PlusStub", "0x343300b5d84D444B2ADc9116FEF1bED02BE49Cf2"
  );

  return { contract };
});
