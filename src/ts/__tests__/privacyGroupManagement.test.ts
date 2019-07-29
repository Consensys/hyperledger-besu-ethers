
import { providers, utils } from '../index'

jest.setTimeout(15000)

const urlNode1 = "http://localhost:20000";
const providerNode1 = new providers.EeaJsonRpcProvider(urlNode1);
providerNode1.on('debug', (info) => {
    console.log(`Sent "${info.action}" action to node 1 with request: ${JSON.stringify(info.request)}\nResponse: ${JSON.stringify(info.response)}`);
})

const urlNode2 = "http://localhost:20002";
const providerNode2 = new providers.EeaJsonRpcProvider(urlNode2);
providerNode2.on('debug', (info) => {
    console.log(`Sent "${info.action}" action to node 2 with request: ${JSON.stringify(info.request)}\nResponse: ${JSON.stringify(info.response)}`);
})

const urlNode3 = "http://localhost:20004";
const providerNode3 = new providers.EeaJsonRpcProvider(urlNode3);
providerNode3.on('debug', (info) => {
    console.log(`Sent "${info.action}" action to node 3 with request: ${JSON.stringify(info.request)}\nResponse: ${JSON.stringify(info.response)}`);
})

// const node1 = 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo='
const node2 = 'Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='
const node3 = 'k2zXEin4Ip/qBGlRkJejnGWdP9cjkK+DAvKNW31L2C8='
// const invalidNode = '00000000000000000000000000000000000000000001'

describe('Privacy Group Management APIs', () => {

    let node1EnodeUrl: string

    beforeAll(async () => {
        node1EnodeUrl = await providerNode1.send('net_enode', [])
        console.log(`enode url ${node1EnodeUrl}\nnode1 public key: ${node1EnodeUrl.substring(9, 136)}`)
    })

    describe('privacy group management', () => {

        describe('Create, find and delete', () => {

            let firstPrivacyGroupId: string
            let duplicatePrivacyGroupId: string

            test('find no existing privacy groups', async () => {
                const results = await providerNode2.findPrivacyGroup([node2, node3])
                expect(results).toHaveLength(0)
            })

            test('Create privacy group', async () => {
                firstPrivacyGroupId = await providerNode2.createPrivacyGroup(
                    node2,
                    'Node2_3',
                    'node2, [node2, node3]',
                    [node2, node3])
                expect(firstPrivacyGroupId).toMatch(utils.RegEx.base64)
                expect(firstPrivacyGroupId).toHaveLength(44)
            })

            test('find privacy group from node2 that created it', async () => {
                const results = await providerNode2.findPrivacyGroup([node2, node3])
                expect(results).toHaveLength(1)
            })

            test('find privacy group from node3 that is a member', async () => {
                const results = await providerNode3.findPrivacyGroup([node2, node3])
                expect(results).toHaveLength(1)
            })

            // test('find privacy group from node1 that is NOT a member', async () => {
            //     const results = await providerNode1.findPrivacyGroup([node2, node3])
            //     expect(results).toHaveLength(0)
            // })

            test('Duplicate privacy group', async () => {
                duplicatePrivacyGroupId = await providerNode2.createPrivacyGroup(
                    node2,
                    'Node2_3',
                    'node2, [node2, node3]',
                    [node2, node3])
                expect(duplicatePrivacyGroupId).toMatch(utils.RegEx.base64)
                expect(duplicatePrivacyGroupId).toHaveLength(44)
                expect(duplicatePrivacyGroupId).toEqual(firstPrivacyGroupId)
            })

            // test('node1 can\'t delete a privacy group they are not a member of', async () => {
            //     expect.assertions(2)
            //     try {
            //         await providerNode1.deletePrivacyGroup(node2, firstPrivacyGroupId)
            //     }
            //     catch (err) {
            //         expect(err).toBeInstanceOf(Error)
            //         expect(err.message).toMatch(/Error deleting privacy group/)
            //     }
            // })

            test('node2 deletes first privacy group', async () => {
                const deletedPrivacyGroupId = await providerNode2.deletePrivacyGroup(node2, firstPrivacyGroupId)
                expect(deletedPrivacyGroupId).toEqual(firstPrivacyGroupId)

                const results = await providerNode2.findPrivacyGroup([node2, node3])
                expect(results).toHaveLength(0)
            })

            // test('deleted privacy group has propagated to node3', async () => {
            //     const results = await providerNode3.findPrivacyGroup([node2, node3])
            //     expect(results).toHaveLength(1)
            // })
            //
            // // TODO delete once create does not duplicate
            // test('node3 deletes duplicate privacy group', async () => {
            //     const result = await providerNode3.deletePrivacyGroup(node3, duplicatePrivacyGroupId)
            //     expect(result).toEqual(duplicatePrivacyGroupId)
            //
            //     const results = await providerNode3.findPrivacyGroup([node2, node3])
            //     expect(results).toHaveLength(0)
            // })
            //
            // test('deleted privacy group has propagated to node2', async () => {
            //     const results = await providerNode2.findPrivacyGroup([node2, node3])
            //     expect(results).toHaveLength(0)
            // })
        })

        // describe('Successful', () => {
        //
        //     const privacyGroups: string[] = []
        //
        //     test.each`
        //     reason | privateFrom | name | description | addresses
        //     ${'all three nodes'} | ${node1} | ${'Short name'} | ${'Top secret stuff in this long description'} | ${[node1, node2, node3]}
        //     ${'duplicate'} | ${node1}  | ${'Short name'} | ${'Top secret stuff in this long description'} | ${[node1, node2, node3]}
        //     ${'all three nodes diff name and desc'} | ${node1}  | ${'Second group'} | ${'Second group with the same members'} | ${[node1, node2, node3]}
        //     ${'only self in group'} | ${node3} | ${'Self'} | ${'Only self in group'} | ${[node3]}
        //     `('$reason when privateFrom $privateFrom, name $name, description $description and addresses $addresses',
        //         async ({privateFrom, name, description, addresses}) => {
        //             const privacyGroupId = await providerNode1.createPrivacyGroup(privateFrom, name, description, addresses)
        //             expect(privacyGroupId).toMatch(utils.RegEx.base64)
        //             expect(privacyGroupId).toHaveLength(44)
        //
        //             privacyGroups.push(privacyGroupId)
        //         })
        //
        //     test('delete each groups', () => {
        //         privacyGroups.forEach(async (privacyGroupId) => {
        //             const result = await providerNode1.deletePrivacyGroup(node1, privacyGroupId)
        //             expect(result).toEqual(privacyGroupId)
        //         })
        //     })
        // })
        //
        // describe('Failed', () => {
        //     test.each`
        //     reason | errorRegEx | privateFrom | name | description | addresses
        //     ${'privateFrom undefined'} | ${/Invalid params/} | ${undefined}  | ${'Test'} | ${'Test desc'} | ${[node2, node3]}
        //     ${'addresses undefined'} | ${/Invalid params/} | ${node1}  | ${'Test'} | ${'Test desc'} | ${undefined}
        //     ${'addresses empty array'} | ${/Error creating privacy group/} | ${node1}  | ${'Test'} | ${'Test desc'} | ${[]}
        //     ${'invalid node in addresses'} | ${/Error creating privacy group/} | ${node2}  | ${'Test'} | ${'Test desc'} | ${[node2, invalidNode]}
        //     ${'invalid privateFrom'} | ${/Error creating privacy group/} | ${invalidNode}  | ${'Test'} | ${'Test desc'} | ${[node2, node3]}
        //     ${'privateFrom not in addresses'} | ${/the list of addresses should include self/} | ${node1}  | ${'Second group'} | ${'Second group with the same members'} | ${[node2, node3]}
        //     `('$reason to fail with $errorRegEx when privateFrom $privateFrom, name $name, description $description and addresses $addresses',
        //
        //         async ({privateFrom, errorRegEx, name, description, addresses}) => {
        //
        //             expect.assertions(2)
        //
        //             try {
        //                 await providerNode1.createPrivacyGroup(privateFrom, name, description, addresses)
        //             }
        //             catch (err) {
        //                 expect(err).toBeInstanceOf(Error)
        //                 expect(err.message).toMatch(errorRegEx)
        //             }
        //         })
        // })
    })
})
