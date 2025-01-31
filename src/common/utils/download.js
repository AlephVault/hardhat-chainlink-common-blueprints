const fs = require('fs');
const path = require('path');

/**
 * Downloads the contents and stores them in the given cache
 * file path.
 * @param filePath The path to store the cache.
 * @param downloadContents The function that downloads the
 * contents. It just downloads the contents and returns them
 * as a JSON array (in a promise).
 * @returns {Promise<*[]>} The contents (async function).
 */
async function downloadAndStoreFeedContracts(filePath, downloadContents) {
    const contents = await downloadContents();
    fs.writeFileSync(filePath, JSON.stringify(contents, null, 2), 'utf8');
    return contents;
}

/**
 * Reads the contents of the existing cache files from the
 * given cache path.
 * @param filePath The path to read the cache from.
 * @returns {*[]|null} The contents (async function) or null if not valid.
 */
function readStoredContents(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(content);
        if (!Array.isArray(json) || json.length === 0) {
            return null;
        } else {
            return json;
        }
    } catch(e) {
        return null;
    }
}

/**
 * Reads and/or re-downloads the cached values.
 * @param filePath The related cache file path.
 * @param force Whether to actually force a re-download.
 * @param downloadContents The function that downloads the
 * contents. It just downloads the contents and returns them
 * as a JSON array (in a promise).
 * @returns {Promise<*[]>} The cache contents (async function).
 */
async function getCachedValues(filePath, force, downloadContents) {
    try {
        // Ensure directory exists.
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // If the file does not exist or the download
        // is forced, then download the contents.
        // Otherwise, read the contents and, if that
        // fails, re-download them.
        if (force || !fs.existsSync(filePath)) {
            return await downloadAndStoreFeedContracts(filePath, downloadContents);
        } else {
            return readStoredContents(filePath) || await downloadAndStoreFeedContracts(filePath, downloadContents);
        }
    } catch (error) {
        // If any error occurs, reset the file and make
        // sure the cache is downloaded again.
        return await downloadAndStoreFeedContracts(filePath, downloadContents);
    }
}

module.exports = {
    getCachedValues
}