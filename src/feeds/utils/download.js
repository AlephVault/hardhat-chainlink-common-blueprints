const { getCachedValues } = require("../../common/utils/download");

const FULL_FEEDS_FILE_PATH = '/tmp/hardhat-chainlink/feeds/full.json';

const fetchInit = {
    "credentials": "omit",
    "headers": {
        "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "Priority": "u=4",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache"
    },
    "referrer": "https://docs.chain.link/",
    "method": "GET",
    "mode": "cors"
}

/**
 * Criteria that asks for a feed to be of Price type.
 * @param e The entry
 * @returns {boolean} Whether it's of Price type or not.
 */
function feedIsProductTypePrice(e) {
    return e.docs?.productType === "Price";
}

/**
 * Adds all the Price Feed entries from a given chain
 * according to the Chainlink's directory. Only entries
 * with decimals will be included.
 * @param url The URL of the directory.
 * @param chainId The chain id.
 * @param entries The entries to populate.
 * @returns {Promise<void>} Nothing (async function).
 */
async function addEntries(url, chainId, entries) {
    console.log(`Retrieving ChainLink PriceFeed data from url: ${url}...`)
    let response = await fetch(url, fetchInit);
    console.log(`>>> Status code: ${response.status}`)
    if (response.status !== 200) return;
    let result = await response.json();
    if (!(result instanceof Array)) {
        console.log(">>> Skipping (not an array)");
    }
    console.log(`>>> # of elements: ${(typeof result.length === "number" ? result.length : "Not an array!")}`);

    result.sort((a, b) => {
        const au = a.name.toUpperCase();
        const bu = b.name.toUpperCase();
        if (au > bu) {
            return 1;
        } else if (bu > au) {
            return -1;
        } else {
            return 0;
        }
    });

    for(let entry of result) {
        if (typeof entry.decimals === "number") {
            entries.push({
                chainId, address: entry.proxyAddress, decimals: entry.decimals, name: entry.name
            });
        }
    }
}

/**
 * Returns all the entries from a given list of directories
 * from Chainlink's database. All of them include the fields:
 * {chainId, address, decimals, name}.
 * @returns {Promise<*[]>} All the entries (async function),
 * considering only those with decimals being set.
 */
async function downloadFeedContracts() {
    const allEntries = [];
    const sources = [
        {url: "https://reference-data-directory.vercel.app/feeds-mainnet.json", chainId: 1},
        {url: "https://reference-data-directory.vercel.app/feeds-ethereum-testnet-sepolia.json", chainId: 11155111},
        {url: "https://reference-data-directory.vercel.app/feeds-matic-mainnet.json", chainId: 137},
        {url: "https://reference-data-directory.vercel.app/feeds-polygon-testnet-amoy.json", chainId: 80002},
        {url: "https://reference-data-directory.vercel.app/feeds-bsc-mainnet.json", chainId: 56},
        {url: "https://reference-data-directory.vercel.app/feeds-bsc-testnet.json", chainId: 97},
        {url: "https://reference-data-directory.vercel.app/feeds-xdai-mainnet.json", chainId: 100},
        {url: "https://reference-data-directory.vercel.app/feeds-avalanche-mainnet.json", chainId: 43114},
        {url: "https://reference-data-directory.vercel.app/feeds-avalanche-fuji-testnet.json", chainId: 43113},
        {url: "https://reference-data-directory.vercel.app/feeds-fantom-mainnet.json", chainId: 250},
        {url: "https://reference-data-directory.vercel.app/feeds-fantom-testnet.json", chainId: 4002},
        {url: "https://reference-data-directory.vercel.app/feeds-ethereum-mainnet-arbitrum-1.json", chainId: 42161},
        {url: "https://reference-data-directory.vercel.app/feeds-ethereum-testnet-sepolia-arbitrum-1.json", chainId: 421614},
        {url: "https://reference-data-directory.vercel.app/feeds-ethereum-mainnet-optimism-1.json", chainId: 69},
        {url: "https://reference-data-directory.vercel.app/feeds-ethereum-testnet-sepolia-optimism-1.json", chainId: 420},
        {url: "https://reference-data-directory.vercel.app/feeds-kusama-mainnet-moonriver.json", chainId: 1285},
        {url: "https://reference-data-directory.vercel.app/feeds-polkadot-mainnet-moonbeam.json", chainId: 1284},
        {url: "https://reference-data-directory.vercel.app/feeds-ethereum-mainnet-andromeda-1.json", chainId: 1088},
        {url: "https://reference-data-directory.vercel.app/feeds-ethereum-mainnet-base-1.json", chainId: 8453},
        {url: "https://reference-data-directory.vercel.app/feeds-ethereum-testnet-sepolia-base-1.json", chainId: 84532},
        {url: "https://reference-data-directory.vercel.app/feeds-celo-mainnet.json", chainId: 42220},
        {url: "https://reference-data-directory.vercel.app/feeds-celo-testnet-alfajores.json", chainId: 44787},
        {url: "https://reference-data-directory.vercel.app/feeds-ethereum-mainnet-scroll-1.json", chainId: 534352},
        {url: "https://reference-data-directory.vercel.app/feeds-ethereum-testnet-sepolia-scroll-1.json", chainId: 534351},
        {url: "https://reference-data-directory.vercel.app/feeds-ethereum-mainnet-linea-1.json", chainId: 59144},
        {url: "https://reference-data-directory.vercel.app/feeds-ethereum-mainnet-zksync-1.json", chainId: 324},
        {url: "https://reference-data-directory.vercel.app/feeds-ethereum-testnet-sepolia-zksync-1.json", chainId: 300},
        {url: "https://reference-data-directory.vercel.app/feeds-ethereum-mainnet-polygon-zkevm-1.json", chainId: 1101},
        {url: "https://reference-data-directory.vercel.app/feeds-ethereum-testnet-sepolia-polygon-zkevm-1.json", chainId: 2442},
        {url: "https://reference-data-directory.vercel.app/feeds-ethereum-testnet-sepolia-soneium-1.json", chainId: 1868},
        {url: "https://reference-data-directory.vercel.app/feeds-ethereum-mainnet-starknet-1.json", chainId: 0x534e5f4d41494e},
        {url: "https://reference-data-directory.vercel.app/feeds-ethereum-testnet-sepolia-starknet-1.json", chainId: 0x34550b76e4065},
        {url: "https://reference-data-directory.vercel.app/feeds-hedera-mainnet.json", chainId: 295},
        {url: "https://reference-data-directory.vercel.app/feeds-hedera-testnet.json", chainId: 296},
    ];
    for (let {url, chainId} of sources) {
        try {
            await addEntries(url, chainId, allEntries);
        } catch(e) {
            console.error(
                "There was an error while trying to download the contracts' data for " +
                `url: ${url} chain id: ${chainId}`
            )
            console.error(e)
        }
    }
    return allEntries;
}

/**
 * Reads and/or re-downloads the cache.
 * @returns {Promise<*[]>} The cache contents (async function).
 */
async function getFeedContracts() {
    return await getCachedValues(FULL_FEEDS_FILE_PATH, downloadFeedContracts);
}

module.exports = {
    getFeedContracts
}