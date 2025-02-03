const path = require("path");
const glob = require("glob");

/**
 * Gets all the project files, recursively, matching
 * a pattern.
 * @param hre The hardhat runtime environment.
 * @param subPath The in-project sub-path.
 * @param extensions The extensions of interest.
 * @returns {string[]} The list of files inside the sub-path,
 * not including the sub-path prefix.
 */
function getProjectFiles(hre, subPath, extensions) {
    const root = hre.config.paths.root;
    let resolved = path.resolve(root, subPath);
    if (!resolved.endsWith("/")) resolved += "/";
    const prefixLength = resolved.length;
    const files = glob.sync(path.join(resolved, "**", `*.@(${extensions.join("|")})`));
    return files.map(f => f.substring(prefixLength));
}

module.exports = {
    getProjectFiles
}