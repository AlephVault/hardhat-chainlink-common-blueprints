const path = require("path");
const { extendEnvironment } = require("hardhat/config");
const { getRouters, getDONIDs } = require("./utils/download");
const { simulateScript, decodeResult } = require("@chainlink/functions-toolkit");

const baseDir = path.resolve(
    __dirname, "..", "..", "data", "templates"
);

extendEnvironment((hre) => {
    // task("simulate")
    //     .setAction(async () => {
    //         console.log(await simulateScript({
    //             source: "return Functions.encodeString('Hello World');",
    //             secrets: {},
    //             args: [],
    //             bytesArgs: []
    //         }));
    //     });
    // new hre.methodPrompts.CustomPrompt(
    //     async function() {
    //         return await simulateScript({
    //             source: "return Functions.encodeString('Hello World')",
    //             secrets: {},
    //             args: [],
    //             bytesArgs: []
    //         });
    //     }, {
    //         onError: (e) => {
    //             console.error("There was an error while getting the balance");
    //             console.error(e);
    //         },
    //         onSuccess: (value) => {
    //             console.log("Result:", value);
    //         }
    //     }, [], {}
    // ).asTask("simulate", "Simulates a JS/Deno function call", {onlyExplicitTxOptions: true});
});