const path = require("path");
const glob = require("glob");
const root = require("hardhat").config.paths.root;

/**
 * Gets all the project files, recursively, matching
 * a pattern.
 * @param subPath The in-project sub-path.
 * @param extensions The extensions of interest.
 * @returns {string[]} The list of files inside the sub-path,
 * not including the sub-path prefix.
 */
function getProjectFiles(subPath, extensions) {
    let resolved = path.resolve(root, subPath);
    if (!resolved.endsWith("/")) resolved += "/";
    const prefixLength = resolved.length;
    const files = glob.sync(path.join(resolved, "**", `*.@(${extensions.join("|")})`));
    return files.map(f => f.substring(prefixLength));
}

module.exports = {
    getProjectFiles
}