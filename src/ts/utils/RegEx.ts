export const ethereumAddress = /^0x([A-Fa-f0-9]{40})$/

export const bytes = /^0x([A-Fa-f0-9]{1,})$/
export const bytes32 = /^0x([A-Fa-f0-9]{64})$/
export const bytes64 = /^0x([A-Fa-f0-9]{128})$/
export const transactionHash = bytes32

// Does not match an empty base64 string
// Sourced from https://stackoverflow.com/a/5885097
export const base64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/
