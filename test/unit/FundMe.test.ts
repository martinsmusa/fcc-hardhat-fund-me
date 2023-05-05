import { expect } from 'chai';
import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { developmentChains } from '../../helper-hardhat-config';
import { FundMe, MockV3Aggregator } from 'typechain-types';

const FUNDING_AMOUNT = ethers.utils.parseEther('1');

if (!developmentChains.includes(network.name)) {
    describe.skip;
} else {
    describe('FundMe', async () => {
        let fundMe: FundMe;
        let deployer: string;
        let mockV3Aggregator: MockV3Aggregator;

        beforeEach(async () => {
            await deployments.fixture(['all']);

            const { deployer: accountDeployer } = await getNamedAccounts();

            deployer = accountDeployer;
            fundMe = await ethers.getContract('FundMe', deployer);
            mockV3Aggregator = await ethers.getContract('MockV3Aggregator', deployer);
        });

        describe('Constructor', async () => {
            it('Sets the aggregator addresses correctly', async () => {
                const priceFeedAddress = await fundMe.s_priceFeed();

                expect(priceFeedAddress).to.be.equal(mockV3Aggregator.address);
            });
        });

        describe('Fund', async () => {
            it('Fails if not enough eth is sent', async () => {
                await expect(fundMe.fund()).to.be.reverted;
            });

            it('Updates the amount of funded data structure', async () => {
                await fundMe.fund({ value: FUNDING_AMOUNT });
                const fundingAmount = await fundMe.getAddressToAmountFunded(deployer);

                expect(fundingAmount.toString()).to.be.equal(FUNDING_AMOUNT.toString());
            });

            it('Adds funders to an array of funders', async () => {
                await fundMe.fund({ value: FUNDING_AMOUNT });
                const funder = await fundMe.getFunder(0);
                expect(funder).to.equal(deployer);
            });
        });

        describe('Withdraw', async () => {
            beforeEach(async () => {
                await fundMe.fund({ value: FUNDING_AMOUNT });
            });

            it('withdraw eth from a single funder', async () => {
                // Arrange
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

                // Act
                const txRes = await fundMe.withdraw();
                const txReceipt = await txRes.wait(1);
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

                // Assert
                // expect(endingFundMeBalance).to.equal(0);
                expect(startingFundMeBalance.add(startingDeployerBalance).toString())
                    .to.equal(endingDeployerBalance.add(txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice)).toString());
            });

            it('Allows to withdraw with multiple funders', async () => {
                const accounts = await ethers.getSigners();
                const fundingAccPromiseArr = accounts.map((account, index) => {
                    if (index > 5) {
                        return null;
                    }

                    return fundMe.connect(account).fund({ value: FUNDING_AMOUNT });
                }).filter(acc => acc);
                await Promise.all(fundingAccPromiseArr);

                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

                const txRes = await fundMe.withdraw();
                const receipt = await txRes.wait(1);

                const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

                // Assert
                // expect(endingFundMeBalance).to.equal(0);
                expect(startingFundMeBalance.add(startingDeployerBalance).toString())
                    .to.equal(endingDeployerBalance.add(receipt.gasUsed.mul(receipt.effectiveGasPrice)).toString());

                await expect(fundMe.getFunder(0)).to.be.reverted;

                accounts.map(async (account, index) => {
                    if (index > 5) {
                        return null;
                    }

                    await expect(fundMe.getAddressToAmountFunded(account.address)).equal(0);
                });
            });

            it('allows only the owner to withdraw', async () => {
                const accounts = await ethers.getSigners();
                const attacker = accounts[1];
                const connectedAttacker = await fundMe.connect(attacker);

                await expect(connectedAttacker.withdraw()).to.be.revertedWith('FundMe__NotOwner');
            });

            it('cheaper withdraw eth from a single funder', async () => {
                // Arrange
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

                // Act
                const txRes = await fundMe.cheaperWithdraw();
                const txReceipt = await txRes.wait(1);
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

                // Assert
                // expect(endingFundMeBalance).to.equal(0);
                expect(startingFundMeBalance.add(startingDeployerBalance).toString())
                    .to.equal(endingDeployerBalance.add(txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice)).toString());
            });

            it('Allows to cheaperWithdraw with multiple funders', async () => {
                const accounts = await ethers.getSigners();
                const fundingAccPromiseArr = accounts.map((account, index) => {
                    if (index > 5) {
                        return null;
                    }

                    return fundMe.connect(account).fund({ value: FUNDING_AMOUNT });
                }).filter(acc => acc);
                await Promise.all(fundingAccPromiseArr);

                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const startingDeployerBalance = await fundMe.provider.getBalance(deployer);

                const txRes = await fundMe.cheaperWithdraw();
                const receipt = await txRes.wait(1);

                const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

                // Assert
                // expect(endingFundMeBalance).to.equal(0);
                expect(startingFundMeBalance.add(startingDeployerBalance).toString())
                    .to.equal(endingDeployerBalance.add(receipt.gasUsed.mul(receipt.effectiveGasPrice)).toString());

                await expect(fundMe.getFunder(0)).to.be.reverted;

                accounts.map(async (account, index) => {
                    if (index > 5) {
                        return null;
                    }

                    await expect(fundMe.getAddressToAmountFunded(account.address)).equal(0);
                });
            });

            it('allows only the owner to cheaper withdraw', async () => {
                const accounts = await ethers.getSigners();
                const attacker = accounts[1];
                const connectedAttacker = await fundMe.connect(attacker);

                await expect(connectedAttacker.cheaperWithdraw()).to.be.revertedWith('FundMe__NotOwner');
            });
        });
    });
}
