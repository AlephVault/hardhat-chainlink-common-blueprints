### Setup related to VRF
For local development, no setup is needed.

For testnets and mainnets, you need to create subscriptions and fund them.

Take a look at the [Chainlink VRF Management](https://https://vrf.chain.link/) page to manage your VRF subscriptions.
VRF subscriptions can be funded with either LINK tokens or natively. The first step here is to create your subscription
there (this might require some amount of gas).

The next step is to fund your subscription. This can be done by paying with either LINK or native currency and:

1. In the same interface.
2. With this plugin, via command line.

For the second option, there are commands to fund a subscription. They must be executed by choosing an account with
either LINK or NATIVE funds, depending on the command. The steps come as follows:

1. Create a reference to an existing Coordinator contract (V2 and V2.5 are supported).
2. Ensure you set up an account (via mnemonic or explicit private key) with LINK