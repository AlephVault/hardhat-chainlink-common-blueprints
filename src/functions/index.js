const path = require("path");
const { extendEnvironment } = require("hardhat/config");
const { getRouters, getDONIDs } = require("./utils/download");

const baseDir = path.resolve(
    __dirname, "..", "..", "data", "templates"
);

extendEnvironment((hre) => {

});