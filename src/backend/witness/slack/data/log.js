import { limit } from '../../../config/index'
import { connect } from '../../../util/db'

const collectionName = 'slack-logs'

export const addLog = (message, type = 'log') => {
  connect(async db => {
    const collection = db.collection(collectionName)
    let item = { type, message, stamp: Date.now() }
    await collection.deleteMany({
      stamp: { $lte: Date.now() - limit }
    })
    await collection.insertOne(item)
    return item
  })
}

export const getLogs = () =>
  connect(async db => {
    const collection = db.collection(collectionName)
    return await collection
      .find({})
      .toArray()
      .then(logs => logs.map(({ stamp, message, type }) => ({ stamp, message, type })))
      .catch(() => [])
  })
