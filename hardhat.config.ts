import "@typechain/hardhat"
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-ethers"
import "hardhat-gas-reporter"
import "dotenv/config"
import "hardhat-deploy"
import "solidity-coverage"

import dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/config';

dotenv.config();

const config: HardhatUserConfig = {
    solidity: {
        compilers: [{ version: '0.8.8' }, { version: '0.6.6' }]
    },
    defaultNetwork: 'hardhat',
    networks: {
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL,
            accounts: [process.env.PRIVATE_KEY as string]
        },
        localhost: {
            url: 'http://127.0.0.1:8545/',
            chainId: 31337
        }
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY
    },
    gasReporter: {
        enabled: true,
        noColors: true,
        outputFile: 'gas-report.txt',
        currency: 'EUR',
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        token: 'ETH'
    },
    namedAccounts: {
        deployer: {
            default: 0
        }
    }
};

export default config;
