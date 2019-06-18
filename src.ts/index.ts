import {ethers} from 'ethers'
// Import the overridden transaction functions
import * as transactions from './transactions'
import * as bytes from './bytes'
import * as RLP from './rlp'
import { EEA_Wallet } from './eeaWallet'

const privateEthers = {
    ...ethers,
    Wallet: EEA_Wallet,
    utils: {
        ...ethers.utils,
        ...bytes,
        ...RLP,
        ...transactions
    }
}

export = privateEthers
