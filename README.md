# hardhat-chainlink-common-blueprints
A hardhat plugin providing helpers to play with mocks of Chainlink services, and generate templates of Chainlink
contracts.

Currently, there's support for Price Feeds and VRF. Support for functions is an ongoing work to be released in future
versions.

This package requires complete Chainlink knowledge, for which there's plenty official information online, and several
courses and hackatons for that purpose. This README file assumes some of that knowledge, while brief explanations
will be given for the features.

## Installation
Run this command to install it from NPM:

```shell
npm install --save-dev @chainlink/contracts@^1.3.0 @chainlink/functions-toolkit@^0.3.2 @chainlink/env-enc@^1.0.5 hardhat-common-tools@^1.6.0 hardhat-enquirer-plus@^1.4.5 hardhat-blueprints@^1.4.0 hardhat-ignition-deploy-everything@^1.1.0 hardhat-method-prompts@^1.3.1
```

### Instructions related to Chainlink VRF
There are no particular instructions for the VRF feature.

### Instructions related to Chainlink Functions
_Chainlink Functions is an ongoing development and will be ready for some latter minor version._

**A Deno interpreter is required** to execute local. Always follow the **official** Deno documentation.

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

## Setup
Setup instructions are project-wide, contrary to the installation instructions which are machine-wide.

The first thing to do is to add the plug-in and dependencies in the hardhat project as follows:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("@chainlink/functions-toolkit");
require("hardhat-enquirer-plus");
require("hardhat-common-tools");
require("hardhat-blueprints");
require("hardhat-method-prompts");
require("hardhat-ignition-deploy-everything");
require("hardhat-chainlink-contracts");
```

## Price Feeds
Price Feed related documentation can be found [here](README.Feeds.md).

## VRF
VRF related documentation can be found [here](README.VRF.md).

## Functions
Functions related documentation will be ready in some latter minor version, as this is a work in progress.
