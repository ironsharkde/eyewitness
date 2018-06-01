import { MongoClient } from 'mongodb'
import assert from 'assert'

// Connection URL
const url = 'mongodb://localhost:27017'
const dbName = 'eyewitness'

export function connect(action) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function(err, client) {
      assert.equal(null, err)
      const db = client.db(dbName)
      if (typeof action === 'function') {
        action(db)
          .then(result => {
            resolve(result)
            client.close()
          })
          .catch(() => {
            reject()
            client.close()
          })
      }
    })
  })
}

export const prepareStampQuery = ({ from, to, fromOffset } = {}) => {
  let query = {}
  if (to) {
    query.stamp = {
      ...query.stamp,
      $lte: parseInt(to, 10)
    }
  }
  if (fromOffset) {
    query.stamp = {
      ...query.stamp,
      $gte: Date.now() - parseInt(fromOffset, 10)
    }
  }
  if (from) {
    query.stamp = {
      ...query.stamp,
      $gte: parseInt(from, 10)
    }
  }
  return query
}
