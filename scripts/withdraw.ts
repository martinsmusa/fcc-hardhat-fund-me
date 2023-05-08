import { ethers, getNamedAccounts } from 'hardhat';
import { FundMe } from 'typechain-types';

const main = async () => {
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract<FundMe>('FundMe', deployer);

    console.log('Withdrawing contract is at: ', fundMe.address);

    const txRes = await fundMe.withdraw();
    await txRes.wait(1);

    console.log('Withdraw contract with 0.01 ETH');
};

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });