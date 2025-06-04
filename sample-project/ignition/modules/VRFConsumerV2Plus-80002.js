const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const path = require("path");
let relativePath = path.relative(
    __dirname, path.resolve(
        require("hardhat").config.paths.root, "ignition", "modules",
        "VRFCoordinatorV2Plus-80002.js".replaceAll("\\", "/")
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
  const keyHash = "0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899";
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
