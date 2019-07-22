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
import * as RegEx from './utils/RegEx'
export * from './privacyGroup'

export const utils = {
    ...ethers.utils,
    ...bytes,
    ...RLP,
    RegEx: {
        ...RegEx,
    },
    ...eeaTransactions
}

export * from './eeaWallet'
