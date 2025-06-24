import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    "apechain-testnet": {
      url: "https://curtis.rpc.caldera.xyz/http",
      chainId: 33111,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei
    },
    "apechain-mainnet": {
      url: "https://apechain.calderachain.xyz/http",
      chainId: 33139,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei
    },
  },
  etherscan: {
    apiKey: {
      "apechain-testnet": "your-api-key-here", // Replace with actual API key if available
      "apechain-mainnet": "your-api-key-here", // Replace with actual API key if available
    },
    customChains: [
      {
        network: "apechain-testnet",
        chainId: 33111,
        urls: {
          apiURL: "https://curtis.explorer.caldera.xyz/api",
          browserURL: "https://curtis.explorer.caldera.xyz/",
        },
      },
      {
        network: "apechain-mainnet",
        chainId: 33139,
        urls: {
          apiURL: "https://apechain.calderaexplorer.xyz/api",
          browserURL: "https://apechain.calderaexplorer.xyz/",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};

export default config;
