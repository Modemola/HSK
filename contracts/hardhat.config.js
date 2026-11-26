require("@nomicfoundation/hardhat-toolbox");
const { subtask } = require("hardhat/config");
const {
  TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD,
} = require("hardhat/builtin-tasks/task-names");
const path = require("path");

const SOLC_VERSION = "0.8.28";

// binaries.soliditylang.org may be unreachable (sandboxed CI, restricted
// networks). Use the solcjs build shipped in the `solc` npm package instead.
subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD, async (args, hre, runSuper) => {
  if (args.solcVersion === SOLC_VERSION) {
    const compilerPath = path.join(__dirname, "node_modules", "solc", "soljson.js");
    return {
      compilerPath,
      isSolcJs: true,
      version: args.solcVersion,
      longVersion: require("solc/package.json").version,
    };
  }
  return runSuper();
});

const accounts = process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: SOLC_VERSION,
    settings: { optimizer: { enabled: true, runs: 500 }, evmVersion: "shanghai" },
  },
  networks: {
    hashkeyTestnet: { url: process.env.HSK_TESTNET_RPC || "https://testnet.hsk.xyz", chainId: 133, accounts },
    hashkeyMainnet: { url: process.env.HSK_MAINNET_RPC || "https://mainnet.hsk.xyz", chainId: 177, accounts },
  },
  etherscan: {
    apiKey: { hashkeyMainnet: "empty", hashkeyTestnet: "empty" },
    customChains: [
      {
        network: "hashkeyMainnet",
        chainId: 177,
        urls: { apiURL: "https://hsk.blockscout.com/api", browserURL: "https://hsk.blockscout.com" },
      },
      {
        network: "hashkeyTestnet",
        chainId: 133,
        urls: {
          apiURL: "https://testnet-explorer.hskchain.net/api",
          browserURL: "https://testnet-explorer.hskchain.net",
        },
      },
    ],
  },
  sourcify: { enabled: false },
};
