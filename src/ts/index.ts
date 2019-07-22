import * as ethers from 'ethers'
export * from 'ethers'

// Import the overridden transaction functions
import * as eeaProviders from './eeaProvider'
export const providers = {
    ...ethers.providers,
    ...eeaProviders,
}

import * as eeaTransactions from './eeaTransaction'
export * from './eeaTransaction'
import * as bytes from './bytes'
import * as RLP from './rlp'

export const utils = {
    ...ethers.utils,
    ...bytes,
    ...RLP,
    ...eeaTransactions
}

export * from './eeaWallet'
