
import { encode} from '../rlp'

describe('RLP', () => {

    describe('encode', () => {
        test('rule 1 - zero byte hex string', () => {
            expect(encode('0x00')).toEqual('0x00')
            expect(encode('0x01')).toEqual('0x01')
            expect(encode('0x7f')).toEqual('0x7f')
            expect(encode('h')).toEqual('0x68')
            expect(encode('0')).toEqual('0x30')
            expect(encode('1')).toEqual('0x31')
            expect(encode(0)).toEqual('0x00')
            expect(encode(1)).toEqual('0x01')
            expect(encode(10)).toEqual('0x0a')
            expect(encode(55)).toEqual('0x37')
            expect(encode(56)).toEqual('0x38')
            expect(encode('0x01')).toEqual('0x01')
            expect(encode('0x0a')).toEqual('0x0a')
            expect(encode('0x0A')).toEqual('0x0a')
            expect(encode('0x0A')).toEqual('0x0a')
            expect(encode('0x7F')).toEqual('0x7f')
        })

        test('rule 2 - non-values', () => {
            expect(encode('0x')).toEqual('0x80')
            expect(encode('')).toEqual('0x80')
        })

        test('rule 3 - special bytes', () => {
            expect(encode('0x80')).toEqual('0x8180')
            expect(encode('0x81')).toEqual('0x8181')
            expect(encode('0x82')).toEqual('0x8182')
            expect(encode('0xfe')).toEqual('0x81fe')
            expect(encode('0xff')).toEqual('0x81ff')
        })

        describe('rule 4 - strings 2–55 bytes long', () => {
            test('small strings', () => {
                expect(encode('he')).toEqual('0x826865')
                expect(encode('hello world')).toEqual(
                    '0x8b68656c6c6f20776f726c64')
            })

            test('lowercase address', () => {
                const result = encode('0xfe3b557e8fb62b89f4916b721be55ceb828dbd73')
                expect(result).toEqual(
                    "0x94" + // 0x80 + 0x14 (20 bytes)
                    "fe3b557e8fb62b89f491" +
                    "6b721be55ceb828dbd73")
            })

            test('mixed case address', () => {
                const result = encode('0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf')
                expect(result).toEqual(
                    "0x94" + // 0x80 + 0x14 (20 bytes)
                    "7e5f4552091a69125d5dfcb7b8c2659029395bdf")
            })

            test('55 byte string', () => {
                expect(encode('0123456789abcdef0123456789abcdef0123456789abcdef0123456')).toEqual(
                    "0xb7" + // 0x80 + 0x37 (55 bytes)
                    '3031323334353637' +
                    '3839616263646566' +
                    '3031323334353637' +
                    '3839616263646566' +
                    '3031323334353637' +
                    '3839616263646566' +
                    '30313233343536')
            })

            test('numbers that are > 0x7F (127)', () => {
                expect(encode(128)).toEqual('0x8180')
                expect(encode('0x80')).toEqual('0x8180')
                expect(encode(1025)).toEqual('0x820401')
            })
        })

        describe('rule 5 - string > 55 bytes', () => {
            test('56 byte string', () => {
                expect(encode('0123456789abcdef0123456789abcdef0123456789abcdef01234567')).toEqual(
                    "0xb838" + // b7 + 1, 0x38 (56 bytes)
                    '3031323334353637' +
                    '3839616263646566' +
                    '3031323334353637' +
                    '3839616263646566' +
                    '3031323334353637' +
                    '3839616263646566' +
                    '3031323334353637')
            })
        })

        test('rule 6 - empty array', () => {
            expect(encode([])).toEqual('0xc0')
        })

        describe('rule 7 - list with total payload in 0–55 bytes long', () => {
            test('array of strings', () => {
                expect(encode(['hello', 'world'])).toEqual(
                    '0xcc' + // 0xc0 + 5 + 1 + 5 + 1
                        '8568656c6c6f' +
                        '85776f726c64')
            })

            test('array of one address', () => {
                const result = encode(['0xfe3b557e8fb62b89f4916b721be55ceb828dbd73']);
                expect(result).toEqual(
                    "0xd5" + // 0xc0 + 0x14 (20 bytes) + 1
                    "94fe3b557e8fb62b89f491" +
                    "6b721be55ceb828dbd73")
            })


            test('array of one address and two strings', () => {
                const result = encode(['0xfe3b557e8fb62b89f4916b721be55ceb828dbd73', 'hello', 'world']);
                expect(result).toEqual(
                    "0xe1" + // 0xc0 + 0x14 (20 bytes) + 1 + 5 + 1 + 5 + 1 (12 = 0x0c) = 0xc0 + 0x21
                    "94fe3b557e8fb62b89f491" +
                    "6b721be55ceb828dbd73" +
                    '8568656c6c6f' +
                    '85776f726c64')
            })

            test('array of an array', () => {
                const result = encode([['hello']]);
                expect(result).toEqual(
                    "0xc7" +    // 0xc0 + 0x07 (7 bytes)
                    "c6" + // 0xc0 + 0x05 (5 bytes) + 1 = 0xc0 + 0x06
                    "8568656c6c6f")
            })

            test('3 dimension array', () => {
                const result = encode([[['hello']]]);
                expect(result).toEqual(
                    "0xc8" +    // 0xc0 + 0x08 (8 bytes)
                    "c7" +    // 0xc0 + 0x07 (7 bytes)
                    "c6" + // 0xc0 + 0x05 (5 bytes) + 1 = 0xc0 + 0x06
                    "8568656c6c6f")
            })

            test('array of two members', () => {
                const result = encode(['0xfe3b557e8fb62b89f4916b721be55ceb828dbd73', '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf']);
                expect(result).toEqual(
                    "0xea" + // 0xc0 + 0x14 (20 bytes) + 1 + 0x14 (20 bytes) + 1 = 0xc0 + 0x2a (42)
                    "94fe3b557e8fb62b89f4916b721be55ceb828dbd73" +
                    "947e5f4552091a69125d5dfcb7b8c2659029395bdf")
            })

            test('array that contains an array of one address]', () => {
                const result = encode(["0x01", ['0xfe3b557e8fb62b89f4916b721be55ceb828dbd73']]);
                expect(result).toEqual(
                    "0xd7" + // 0xc0  + 0x17 (23 bytes)
                    "01" +
                    "d5" + // 0xc0 + 0x15 (21 bytes)
                    "94fe3b557e8fb62b89f4916b721be55ceb828dbd73")
            })
        })

        describe('rule 8 - list with total payload more than 55 bytes', () => {
            test('array of three members', () => {
                const result = encode([
                    '0xfe3b557e8fb62b89f4916b721be55ceb828dbd73',
                    '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf',
                    '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF']);
                expect(result).toEqual(
                    "0xf83f" + // 0xf7 + 1, 3 * 0x15 (21 bytes) = 0x3f (63 bytes)
                    "94fe3b557e8fb62b89f4916b721be55ceb828dbd73" +
                    "947e5f4552091a69125d5dfcb7b8c2659029395bdf" +
                    "942b5ad5c4795c026514f8317c7a215e218dccd6cf")
            })
        })

        // Rule 9 is not listed on the EF wiki page https://github.com/ethereum/wiki/wiki/RLP
        // But is implemented in Geth as documented in this post
        // https://medium.com/coinmonks/data-structure-in-ethereum-episode-1-recursive-length-prefix-rlp-encoding-decoding-d1016832f919
        describe('rule 9 - booleans', () => {
            test('true', () => {
                expect(encode(true)).toEqual('0x01')
            })

            test('false', () => {
                expect(encode(false)).toEqual('0x80')
            })
        })
    })

})
