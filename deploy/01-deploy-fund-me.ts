import { DeploymentsExtension } from 'hardhat-deploy/dist/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import * as process from 'process';
import { verify } from '../utils/verify';
import { networkConfig, developmentChains } from '../helper-hardhat-config';

const getPriceFeedAddress = async (chainName: string, deployments: DeploymentsExtension): Promise<string> => {
    if (developmentChains.includes(chainName)) {
        const mockAggregator = await deployments.get('MockV3Aggregator');
        return mockAggregator.address;
    }

    if (!(chainName in networkConfig)) {
        throw new Error(`${ chainName } not in network config`);
    }

    return networkConfig[chainName].ethUsdPriceFeed || '';
};

const deployFundMe = async (
    {
        network,
        getNamedAccounts,
        deployments,
        deployments: { deploy, log }
    }: HardhatRuntimeEnvironment
) => {
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    const priceFeedAddress = await getPriceFeedAddress(network.name, deployments);

    if (!priceFeedAddress) {
        throw new Error(`Price feed address not configured for ${ network.name }`);
    }

    const args = [priceFeedAddress];

    log('Deploying FundMe contract');
    const fundMe = await deploy('FundMe', {
        from: deployer,
        log: true,
        waitConfirmations: networkConfig[network.name]?.blockConfirmations || 1,
        args
    });

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log(`Verify with Etherscan API key ${ process.env.ETHERSCAN_API_KEY }`);

        await verify(fundMe.address, args);
    }

    log('<-------------------------------------------->');
}

deployFundMe.tags = ['all', 'fundme'];

export default deployFundMe;
