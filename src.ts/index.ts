import {ethers} from 'ethers'
// Import the overridden transaction functions
import * as transactions from './transactions'
import { PrivateWallet } from './wallet'

const privateEthers = {
    ...ethers,
    Wallet: PrivateWallet,
    utils: {
        ...ethers.utils,
        ...transactions
    }
}

export = privateEthers
