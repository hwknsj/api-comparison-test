// utils.js – helper functions to clean up code

// for external fetching
export const endpoint = ''

export const getData = async (url, baseUrl = endpoint, params = {}) => {
  // in case we can provide parameters
  url = baseUrl + url
  if (params) {
    url = Object.entries(params).reduce(
      (acc, [key, value]) => (acc += `&${encodeURI(key)}=${encodeURI(value)}`),
      url + '?'
    )
  }
  try {
    const res = await fetch(url, { method: 'GET' }).then((res) => res.json())
    return res
  } catch (error) {
    console.error(error)
  }
}

// NOTE: the parameters are given names to indicate their usage according to the goal of this exercise
//       in most cases I would use more general parameter names, but each `util` serves a specific purpose

export const createStoresArray = (stores) =>
  Array.from(
    stores,
    ({ id, attributes, type }) =>
      type === 'stores' && { id, fields: Object.keys(attributes) }
  )

// NOTE: this method looks confusing, but essentially performs an asymmetric difference operation on
//       the elements of the given arrays (targetApiIds, compareApiIds) while simultaneously storing
//       keys of stores[i].attributes (hence, `stores` is a required parameter). not the most efficient
//       but avoids making the assumption described below.
// INFO: returns an object of shape:
// { mockOnly: [ { storeId, missingFrom }, { }, ...], mockFields: [ field1, field2, ... ]}
// mockFields is an array of *every unique key in store.attributes
// !!! this DOES NOT make the assumption that Object.keys(stores[n].attributes) == Object.keys(stores[m].attributes)
// so we collect them in an array, apiFields, as we map through the array
export const diffStoreIdsAndFields = (
  stores,
  targetApiIds,
  compareApiIds,
  api
) => {
  const missingFrom = api === 'mock' ? 'prod' : 'mock'
  // NOTE: if we made the assumption described above, we would store fields = Object.keys(stores[n].attributes)
  // where n < stores.length. would give O(1) time operation
  let apiFields = [...stores[0].fields]
  return {
    [`${api}Only`]: [
      // eslint-disable-next-line
      ...stores.map(({ id, fields }) => {
        // Array.from(new Set([array, of, elements])) returns a new array containing only unique elements
        // a cool trick to remove duplicates, but makes this map O(n*m) where m = fields.length
        apiFields = Array.from(new Set(apiFields.concat([...fields])))
        if (targetApiIds[id] && !compareApiIds[id]) {
          return { storeId: id, missingFrom }
        }
      })
    ],
    [`${api}Fields`]: apiFields
  }
}

export const createStores = (mockOnly, prodOnly) => {
  return [
    ...mockOnly.filter((item) => !!item),
    ...prodOnly.filter((item) => !!item)
  ]
}

export const compareFields = (mockFields, prodFieldsSet) =>
  mockFields.reduce((acc, field) => {
    if (!prodFieldsSet.has(field)) {
      acc.push(field)
    }
    return acc
  }, []) || []
