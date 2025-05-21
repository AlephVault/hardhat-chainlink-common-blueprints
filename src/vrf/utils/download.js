const vrfSettings = [
    // Ethereum Mainnet and Sepolia (Testnet).
    {
        chainId: 1,
        linkAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
        coordinatorAddress: "0xD7f86b4b8Cae7D942340FF628F82735b7a20893a",
        lanes: [
            {name: "200 gwei", hash: "0x8077df514608a09f83e4e8d300645594e5d7234665448ba83f51a50f842bd3d9"},
            {name: "500 gwei", hash: "0x3fd2fec10d06ee8f65e7f2e95f5c56511359ece3f33960ad8a866ae24a8ff10b"},
            {name: "1000 gwei", hash: "0xc6bf2e7b88e5cfbb4946ff23af846494ae1f3c65270b79ee7876c9aa99d3d45f"}
        ]
    },
    {
        chainId: 11155111,
        linkAddress: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
        coordinatorAddress: "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B",
        lanes: [
            {name: "500 gwei", hash: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae"}
        ]
    },
    // Binance Mainnet and Testnet.
    {
        chainId: 56,
        linkAddress: "0x404460C6A5EdE2D891e8297795264fDe62ADBB75",
        coordinatorAddress: "0xd691f04bc0C9a24Edb78af9E005Cf85768F694C9",
        lanes: [
            {name: "200 gwei", hash: "0x130dba50ad435d4ecc214aad0d5820474137bd68e7e77724144f27c3c377d3d4"},
            {name: "500 gwei", hash: "0xeb0f72532fed5c94b4caf7b49caf454b35a729608a441101b9269efb7efe2c6c"},
            {name: "1000 gwei", hash: "0xb94a4fdb12830e15846df59b27d7c5d92c9c24c10cf6ae49655681ba560848dd"}
        ]
    },
    {
        chainId: 97,
        linkAddress: "0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06",
        coordinatorAddress: "0xDA3b641D438362C440Ac5458c57e00a712b66700",
        lanes: [
            {name: "50 gwei", hash: "0x8596b430971ac45bdf6088665b9ad8e8630c9d5049ab54b14dff711bee7c0e26"}
        ]
    },
    // Polygon Mainnet and Amoy (Testnet).
    {
        chainId: 137,
        linkAddress: "0xb0897686c545045aFc77CF20eC7A532E3120E0F1",
        coordinatorAddress: "0xec0Ed46f36576541C75739E915ADbCb3DE24bD77",
        lanes: [
            {name: "200 gwei", hash: "0x0ffbbd0c1c18c0263dd778dadd1d64240d7bc338d95fec1cf0473928ca7eaf9e"},
            {name: "500 gwei", hash: "0x719ed7d7664abc3001c18aac8130a2265e1e70b7e036ae20f3ca8b92b3154d86"},
            {name: "1000 gwei", hash: "0x192234a5cda4cc07c0b66dfbcfbb785341cc790edc50032e842667dbb506cada"}
        ]
    },
    {
        chainId: 80002,
        linkAddress: "0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904",
        coordinatorAddress: "0x343300b5d84D444B2ADc9116FEF1bED02BE49Cf2",
        lanes: [
            {name: "500 gwei", hash: "0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899"}
        ]
    },
    // Avalanche Mainnet and Fuji (Testnet).
    {
        chainId: 43114,
        linkAddress: "0x5947BB275c521040051D82396192181b413227A3",
        coordinatorAddress: "0xE40895D055bccd2053dD0638C9695E326152b1A4",
        lanes: [
            {name: "200 gwei", hash: "0xea7f56be19583eeb8255aa79f16d8bd8a64cedf68e42fefee1c9ac5372b1a102"},
            {name: "500 gwei", hash: "0x84213dcadf1f89e4097eb654e3f284d7d5d5bda2bd4748d8b7fada5b3a6eaa0d"},
            {name: "1000 gwei", hash: "0xe227ebd10a873dde8e58841197a07b410038e405f1180bd117be6f6557fa491c"}
        ]
    },
    {
        chainId: 43113,
        linkAddress: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
        coordinatorAddress: "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE",
        lanes: [
            {name: "300 gwei", hash: "0xc799bd1e3bd4d1a41cd4968997a4e03dfd2a3c7c04b695881138580163f42887"}
        ]
    },
    // Arbitrum One (Mainnet) and Sepolia (Testnet).
    {
        chainId: 42161,
        linkAddress: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
        coordinatorAddress: "0x3C0Ca683b403E37668AE3DC4FB62F4B29B6f7a3e",
        lanes: [
            {name: "2 gwei", hash: "0x9e9e46732b32662b9adc6f3abdf6c5e926a666d174a4d6b8e39c4cca76a38897"},
            {name: "30 gwei", hash: "0x8472ba59cf7134dfe321f4d61a430c4857e8b19cdd5230b09952a92671c24409"},
            {name: "150 gwei", hash: "0xe9f223d7d83ec85c4f78042a4845af3a1c8df7757b4997b815ce4b8d07aca68c"}
        ]
    },
    {
        chainId: 421614,
        linkAddress: "0xb1D4538B4571d411F07960EF2838Ce337FE1E80E",
        coordinatorAddress: "0x5CE8D5A2BC84beb22a398CCA51996F7930313D61",
        lanes: [
            {name: "50 gwei", hash: "0x1770bdc7eec7771f7ba4ffd640f34260d7f095b79c92d34a5b2551d6f6cfd2be"}
        ]
    },
    // Base Mainnet and Sepolia (Testnet).
    {
        chainId: 8453,
        linkAddress: "0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196",
        coordinatorAddress: "0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634",
        lanes: [
            {name: "2 gwei", hash: "0x00b81b5a830cb0a4009fbd8904de511e28631e62ce5ad231373d3cdad373ccab"},
            {name: "30 gwei", hash: "0xdc2f87677b01473c763cb0aee938ed3341512f6057324a584e5944e786144d70"}
        ]
    },
    {
        chainId: 84532,
        linkAddress: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410",
        coordinatorAddress: "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE",
        lanes: [
            {name: "30 gwei", hash: "0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71"}
        ]
    },
    // Fantom Opera (Mainnet) and Testnet.
    {
        chainId: 250,
        linkAddress: "0x6F43FF82CCA38001B6699a8AC47A2d0E66939407",
        coordinatorAddress: "0xd5D517aBE5cF79B7e95eC98dB0f0277788aFF634",
        lanes: [
            {name: "4000 gwei", hash: "0xb4797e686f9a1548b9a2e8c68988d74788e0c4af5899020fb0c47784af76ddfa"},
            {name: "10000 gwei", hash: "0x5881eea62f9876043df723cf89f0c2bb6f950da25e9dfe66995c24f919c8f8ab"},
            {name: "20000 gwei", hash: "0x64ae04e5dba58bc08ba2d53eb33fe95bf71f5002789692fe78fb3778f16121c9"}
        ]
    },
    {
        chainId: 40002,
        linkAddress: "0xfaFedb041c0DD4fA2Dc0d87a6B0979Ee6FA7af5F",
        coordinatorAddress: "0xbd13f08b8352A3635218ab9418E340c60d6Eb418",
        lanes: [
            {name: "3000 gwei", hash: "0x121a143066e0f2f08b620784af77cccb35c6242460b4a8ee251b4b416abaebd4"}
        ]
    }
]


module.exports = {
    getVRFCoordinators: () => vrfSettings.map((e) => ({
        chainId: e.chainId, address: e.coordinatorAdderess, name: "(The only VRF coordinator)"
    })),
    getVRFLaneHashes: () => {
        let lanes = [];
        vrfSettings.forEach((e) => {
            e.lanes.forEach((l) => {
                lanes.push({chainId: e.chainId, value: l.hash, name: l.name});
            });
        });
        return lanes;
    }
}