import * as ethers from 'ethers'
export * from 'ethers'

export * from './privateContract'

// Import the overridden transaction functions
import * as privateProviders from './privateProvider'
export const providers = {
    ...ethers.providers,
    ...privateProviders,
}

import * as privateTransactions from './privateTransaction'
export * from './privateTransaction'
import * as bytes from './bytes'
import * as RLP from './rlp'
import * as RegEx from './utils/RegEx'
export * from './privacyGroup'

export const utils = {
    ...ethers.utils,
    ...bytes,
    ...RLP,
    RegEx: {
        ...RegEx,
    },
    ...privateTransactions
}

export * from './privateWallet'
