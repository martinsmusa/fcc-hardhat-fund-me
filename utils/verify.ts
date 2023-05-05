import { run } from 'hardhat';
import '@nomiclabs/hardhat-etherscan';

export const verify = async (address: string, args: string[] = []) => {
    try {
        await run(
            'verify:verify',
            { address, constructorArguments: args }
        );
    } catch (error: any) {
        if (error?.message?.toLowerCase() === 'already verified') {
            console.log('Contract already verified');
        } else {
            console.error(error);
        }
    } finally {
        console.log('Contract verified');
    }
};