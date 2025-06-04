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

### Local networks

### Main and Test networks