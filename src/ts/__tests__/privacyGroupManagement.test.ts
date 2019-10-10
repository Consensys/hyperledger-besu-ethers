
import { providers, utils } from '../index'

jest.setTimeout(15000)

const urlNode1 = "http://localhost:20000";
const providerNode1 = new providers.PrivateJsonRpcProvider(urlNode1);
providerNode1.on('debug', (info) => {
    console.log(`Sent "${info.action}" action to node 1 with request: ${JSON.stringify(info.request)}\nResponse: ${JSON.stringify(info.response)}`);
})

const urlNode2 = "http://localhost:20002";
const providerNode2 = new providers.PrivateJsonRpcProvider(urlNode2);
providerNode2.on('debug', (info) => {
    console.log(`Sent "${info.action}" action to node 2 with request: ${JSON.stringify(info.request)}\nResponse: ${JSON.stringify(info.response)}`);
})

const urlNode3 = "http://localhost:20004";
const providerNode3 = new providers.PrivateJsonRpcProvider(urlNode3);
providerNode3.on('debug', (info) => {
    console.log(`Sent "${info.action}" action to node 3 with request: ${JSON.stringify(info.request)}\nResponse: ${JSON.stringify(info.response)}`);
})

const node1 = 'A1aVtMxLCUHmBVHXoZzzBgPbW/wj5axDpW9X8l91SGo='
const node2 = 'Ko2bVqD+nNlNYL5EE7y3IdOnviftjiizpjRt+HTuFBs='
const node3 = 'k2zXEin4Ip/qBGlRkJejnGWdP9cjkK+DAvKNW31L2C8='
const invalidNode = '00000000000000000000000000000000000000000001'

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

            test('Create privacy group for node2 and node3', async () => {
                firstPrivacyGroupId = await providerNode2.createPrivacyGroup(
                    [node2, node3],
                    'Node2_3',
                    'Secret for node2 and node3')
                expect(firstPrivacyGroupId).toMatch(utils.RegEx.base64)
                expect(firstPrivacyGroupId).toHaveLength(44)
            })

            test('find privacy group from node2 that created it', async () => {
                const results = await providerNode2.findPrivacyGroup([node2, node3])
                expect(results).toHaveLength(1)
                expect(results[0].privacyGroupId).toEqual(firstPrivacyGroupId)
                expect(results[0].name).toEqual('Node2_3')
                expect(results[0].description).toEqual('Secret for node2 and node3')
                expect(results[0].members).toEqual([node2, node3])
            })

            test('find privacy group from node3 that is a member', async () => {
                const results = await providerNode3.findPrivacyGroup([node2, node3])
                expect(results).toHaveLength(1)
                expect(results[0].privacyGroupId).toEqual(firstPrivacyGroupId)
                expect(results[0].name).toEqual('Node2_3')
                expect(results[0].description).toEqual('Secret for node2 and node3')
                expect(results[0].members).toEqual([node2, node3])
            })

            test('find privacy group from node1 that is NOT a member', async () => {
                const results = await providerNode1.findPrivacyGroup([node2, node3])
                expect(results).toHaveLength(0)
            })

            test('find privacy group just for node2 and not node3', async () => {
                const results = await providerNode1.findPrivacyGroup([node2])
                expect(results).toHaveLength(0)
            })

            test('Duplicate privacy group', async () => {
                duplicatePrivacyGroupId = await providerNode2.createPrivacyGroup(
                    [node2, node3],
                    'Node2_3',
                    'Secret for node2 and node3')
                expect(duplicatePrivacyGroupId).toMatch(utils.RegEx.base64)
                expect(duplicatePrivacyGroupId).toHaveLength(44)
                expect(duplicatePrivacyGroupId).toEqual(firstPrivacyGroupId)
            })

            test('node1 can\'t delete a privacy group they are not a member of', async () => {
                expect.assertions(2)
                try {
                    await providerNode1.deletePrivacyGroup(firstPrivacyGroupId)
                }
                catch (err) {
                    expect(err).toBeInstanceOf(Error)
                    expect(err.message).toMatch(/Error deleting privacy group/)
                }
            })

            test('node2 deletes first privacy group', async () => {
                const deletedPrivacyGroupId = await providerNode2.deletePrivacyGroup(firstPrivacyGroupId)
                expect(deletedPrivacyGroupId).toEqual(firstPrivacyGroupId)

                const results = await providerNode2.findPrivacyGroup([node2, node3])
                expect(results).toHaveLength(1)
            })

            test('deleted privacy group has propagated to node3', async () => {
                const results = await providerNode3.findPrivacyGroup([node2, node3])
                expect(results).toHaveLength(1)
            })

            // TODO delete once create does not duplicate
            test('node3 deletes duplicate privacy group', async () => {
                const result = await providerNode3.deletePrivacyGroup(duplicatePrivacyGroupId)
                expect(result).toEqual(duplicatePrivacyGroupId)

                const results = await providerNode3.findPrivacyGroup([node2, node3])
                expect(results).toHaveLength(0)
            })

            test('deleted privacy group has propagated to node2', async () => {
                const results = await providerNode2.findPrivacyGroup([node2, node3])
                expect(results).toHaveLength(0)
            })
        })

        describe('Successful', () => {

            const privacyGroups: string[] = []

            test.each`
            reason  | name | description | members
            ${'all three nodes'} | ${'Short name'} | ${'Top secret stuff in this long description'} | ${[node1, node2, node3]}
            ${'duplicate'} | ${'Short name'} | ${'Top secret stuff in this long description'} | ${[node1, node2, node3]}
            ${'all three nodes diff name and desc'} | ${'Second group'} | ${'Second group with the same members'} | ${[node1, node2, node3]}
            `('$reason when name $name, description $description and members $members',
                async ({name, description, members}) => {
                    const privacyGroupId = await providerNode1.createPrivacyGroup(members, name, description)
                    expect(privacyGroupId).toMatch(utils.RegEx.base64)
                    expect(privacyGroupId).toHaveLength(44)

                    privacyGroups.push(privacyGroupId)
                })

            test('delete each group', async() => {
                expect.assertions(3)
                for (const privacyGroupId of privacyGroups) {
                    const result = await providerNode1.deletePrivacyGroup(privacyGroupId)
                    expect(result).toEqual(privacyGroupId)
                }
            })
        })

        describe('Failed', () => {
            test.each`
            reason | errorRegEx | name | description | members
            ${'members undefined'} | ${/Invalid params/} | ${'Test'} | ${'Test desc'} | ${undefined}
            ${'members empty array'} | ${/CreatePrivacyGroupShouldIncludeSelf/} | ${'Test'} | ${'Test desc'} | ${[]}
            ${'invalid node in members'} | ${/EnclaveDecodePublicKey/} | ${'Test'} | ${'Test desc'} | ${[node1, invalidNode]}
            ${'privateFrom not in members'} | ${/CreatePrivacyGroupShouldIncludeSelf/} | ${'Second group'} | ${'Second group with the same members'} | ${[node2, node3]}
            `('$reason to fail with $errorRegEx when name $name, description $description and members $members',

                async ({privateFrom, errorRegEx, name, description, members}) => {
                    expect.assertions(2)
                    try {
                        await providerNode1.createPrivacyGroup(members, name, description)
                    }
                    catch (err) {
                        expect(err).toBeInstanceOf(Error)
                        expect(err.message).toMatch(errorRegEx)
                    }
                })
        })
    })

    describe("create privacy group with", () => {

        const privacyGroups: string[] = []

        test.each`
        reason | addresses | name | description
        ${'undefined name and description'} | ${[node2, node3]}  | ${undefined}  | ${undefined}
        ${'null name and description'} | ${[node2, node3]}  | ${null}  | ${null}
        ${'empty name and description'} | ${[node2, node3]}  | ${''}  | ${''}
        ${'number name and description'} | ${[node2, node3]}  | ${1}  | ${2}
      `('$reason when addresses $addresses, name $name and description $description',
          async ({addresses, name, description}) => {
              const privacyGroupId = await providerNode3.createPrivacyGroup(
                addresses, name, description)
              expect(privacyGroupId).toMatch(utils.RegEx.base64)
              expect(privacyGroupId).toHaveLength(44)

              privacyGroups.push(privacyGroupId)
          })

        test('delete each group', async() => {
            expect.assertions(4)
            for (const privacyGroupId of privacyGroups) {
                const result = await providerNode3.deletePrivacyGroup(privacyGroupId)
                expect(result).toEqual(privacyGroupId)
            }
        })
    })
})
