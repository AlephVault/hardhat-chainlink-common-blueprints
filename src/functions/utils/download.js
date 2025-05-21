const functionSettings = [
    // Ethereum Mainnet and Sepolia (Testnet).
    {
        chainId: 1,
        linkAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
        donId: "0x66756e2d657468657265756d2d6d61696e6e65742d3100000000000000000000",
        routerAddress: "0x65Dcc24F8ff9e51F10DCc7Ed1e4e2A61e6E14bd6"
    },
    {
        chainId: 11155111,
        linkAddress: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
        donId: "0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000",
        routerAddress: "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0"
    },
    // Polygon Mainnet and Amoy (Testnet).
    {
        chainId: 137,
        linkAddress: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
        donId: "0x66756e2d706f6c79676f6e2d6d61696e6e65742d310000000000000000000000",
        routerAddress: "0xdc2AAF042Aeff2E68B3e8E33F19e4B9fA7C73F10"
    },
    {
        chainId: 80002,
        linkAddress: "0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904",
        donId: "0x66756e2d706f6c79676f6e2d616d6f792d310000000000000000000000000000",
        routerAddress: "0xC22a79eBA640940ABB6dF0f7982cc119578E11De"
    },
    // Avalanche Mainnet and Fuji (Testnet).
    {
        chainId: 43314,
        linkAddress: "0x5947BB275c521040051D82396192181b413227A3",
        donId: "0x66756e2d6176616c616e6368652d6d61696e6e65742d31000000000000000000",
        routerAddress: "0x9f82a6A0758517FD0AfA463820F586999AF314a0"
    },
    {
        chainId: 43313,
        linkAddress: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
        donId: "0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000",
        routerAddress: "0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0"
    },
    // Arbitrum One (Mainnet) and Sepolia (Testnet).
    {
        chainId: 42161,
        linkAddress: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
        donId: "0x66756e2d617262697472756d2d6d61696e6e65742d3100000000000000000000",
        routerAddress: "0x97083e831f8f0638855e2a515c90edcf158df238"
    },
    {
        chainId: 421614,
        linkAddress: "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E",
        donId: "0x66756e2d617262697472756d2d7365706f6c69612d3100000000000000000000",
        routerAddress: "0x234a5fb5Bd614a7AA2FfAB244D603abFA0Ac5C5C"
    },
    // Base Mainnet and Sepolia (Testnet).
    {
        chainId: 8453,
        linkAddress: "0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196",
        donId: "0x66756e2d626173652d6d61696e6e65742d310000000000000000000000000000",
        routerAddress: "0xf9b8fc078197181c841c296c876945aaa425b278"
    },
    {
        chainId: 84532,
        linkAddress: "0xe4ab69c077896252fafbd49efd26b5d171a32410",
        donId: "0x66756e2d626173652d7365706f6c69612d310000000000000000000000000000",
        routerAddress: "0xf9B8fc078197181C841c296C876945aaa425B278"
    }
]

module.exports = {
    // v1.3.0 routers.
    getRouters: () => [],

    // DON IDs.
    getDONIDs: () => []
}
