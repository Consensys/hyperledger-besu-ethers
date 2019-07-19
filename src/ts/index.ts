import {ethers} from 'ethers'
// Import the overridden transaction functions
import * as eeaProviders from './eeaProvider'
import * as eeaTransactions from './eeaTransaction'
import * as bytes from './bytes'
import * as RLP from './rlp'
import { EeaWallet } from './eeaWallet'

export {  }

const eeaEthers = {
    ...ethers,
    providers: {
        ...ethers.providers,
        ...eeaProviders,
    },
    utils: {
        ...ethers.utils,
        ...bytes,
        ...RLP,
        ...eeaTransactions
    },
    EeaWallet,
}

export = eeaEthers
