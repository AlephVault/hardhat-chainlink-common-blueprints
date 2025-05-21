# hardhat-chainlink-common-blueprints
A hardhat plugin providing helpers to play with mocks of Chainlink services, and generate templates of Chainlink contracts.

Currently, there's support for Price Feeds, VRF and Functions.

## Installation
Run this command to install it from NPM:

```shell
npm install --save-dev @chainlink/contracts@^1.3.0 @chainlink/functions-toolkit@^0.3.2 @chainlink/env-enc@^1.0.5 hardhat-common-tools@^1.6.0 hardhat-enquirer-plus@^1.4.5 hardhat-blueprints@^1.4.0 hardhat-ignition-deploy-everything@^1.1.0 hardhat-method-prompts@^1.3.1
```

**For the functions to be simulated / mocked locally, deno is required**. Always follow the **official** Deno documentation.

In Ubuntu systems, `snap` comes with a defective Deno version _which will not work_. Ensure you uninstall it and,
instead, install it following the official documentation. As of today, the steps are:

```shell
# Execute this line only if deno is installed by snap.
# Don't worry, by this point, if snap is already not
# found (skip this step in that case). Uninstalling
# requires administrator privileges.
#
# Anyway, this step is optional.
snap remove deno

# Execute these lines to install deno. This will install
# it by default in the local user's bin directory, and
# will create new stuff in ~/.bashrc.
curl -fsSL https://deno.land/install.sh | sh
source ~/.bashrc
```