/**
 * Find the difference between two store API outputs.
 *
 * searching specifically for the ids of all stores that are not in the other,
 * as well as the fields from the mock API that are not
 * present in the production one.
 *
 * Example return format
 * {
 *   stores: [
 *     { storeId: 'XXXXX', missingFrom: 'prod || mock' },
 *     ...
 *  ],
 *  fields: [ 'field1', 'field2', ... ]
 * }
 *
 */

/*
  some code by
        .-----------------------------.
        |     joél hawkins torres     |
        |    .-----------------.      |
        |   (| https://joel.fm |)     |
        |    '-----------------'      |
        '-----------------------------'
*/

//  NOTES: I'm trying to make as few assumptions as possible, so I have allowed for options on some methods whic,
//        given some assumption about the data, would make save computation time or space complexity.
// ASSUMPTIONS:
// 1. Each item in the respective api response data of type === 'stores' (a store) have the same set of properties in store.attributes
// 2. "fields" refers to the key names in store.attributes

// Created /lib/utils.js for helper methods

import {
  getData,
  createStoresArray,
  diffStoreIdsAndFields,
  createStores,
  compareFields
} from '../lib/utils'

const mockApiEndpoint = '../data/mockStore.json'
const prodApiEndpoint = '../data/prodStore.json'

const storeApiDifference = async (mockApiEndpoint, prodApiEndpoint) => {
  const mockStores = await getData(mockApiEndpoint)
    .then((res) => res.data)
    .then((stores) => createStoresArray(stores))
  const prodStores = await getData(prodApiEndpoint)
    .then((res) => res.data)
    .then((stores) => createStoresArray(stores))

  // create object where key=id, value=id for each api
  const mockIds = mockStores.reduce(
    (acc, { id }) => Object.assign(acc, { [id]: id }),
    {}
  )
  const prodIds = prodStores.reduce(
    (acc, { id }) => Object.assign(acc, { [id]: id }),
    {}
  )

  // Initial values, see assumption #1: could use this to minimize space/time complexity
  const { mockOnly, mockFields } = diffStoreIdsAndFields(
    mockStores,
    mockIds,
    prodIds,
    'mock'
  )

  // let prodFields = [...prodStores[0].fields];
  const { prodOnly, prodFields } = diffStoreIdsAndFields(
    prodStores,
    prodIds,
    mockIds,
    'prod'
  )

  const stores = createStores(mockOnly, prodOnly)
  const prodFieldsSet = new Set(prodFields)
  const fields = compareFields(mockFields, prodFieldsSet)

  return { stores, fields }
}

storeApiDifference(mockApiEndpoint, prodApiEndpoint).then((result) =>
  console.table({ result })
)
