import { expect } from 'chai';
import { ethers, getNamedAccounts, network } from 'hardhat';
import { developmentChains } from '../../helper-hardhat-config';
import { FundMe } from '../../typechain-types';

if (developmentChains.includes(network.name)) {
    describe.skip;
} else {
    describe('FundMe', async () => {
        let fundMe: FundMe;
        let deployer: string;
        const sendValue = ethers.utils.parseEther('1');

        beforeEach(async () => {
            const { deployer: accountDeployer } = await getNamedAccounts();

            deployer = accountDeployer;
            fundMe = await ethers.getContract('FundMe', deployer);
        });

        it('allows to fund and withdraw funds', async () => {
            await fundMe.fund({value: sendValue});
            await fundMe.withdraw();

            const endingBalance = await ethers.provider.getBalance(fundMe.address);

            expect(endingBalance.toString()).to.equal(0);
        })
    });
}
