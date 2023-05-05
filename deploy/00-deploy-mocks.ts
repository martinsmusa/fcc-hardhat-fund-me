import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { developmentChains } from '../helper-hardhat-config';

const DECIMALS = '18';
const INITIAL_PRICE = '2000000000000000000000'; // 2000

const deployMocks =  async (
    {
        network,
        getNamedAccounts,
        deployments: { deploy, log }
    }: HardhatRuntimeEnvironment
) => {
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    if (developmentChains.includes(network.name)) {
        log('Deploying mock aggregator');

        await deploy('MockV3Aggregator', {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE]
        });
    }

    log('<-------------------------------------------->');
}

deployMocks.tags = ['all', 'mocks'];

export default deployMocks;
