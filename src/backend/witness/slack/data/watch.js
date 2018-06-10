import { uniq } from 'lodash'
import { connect } from '../../../util/db'

const collectionName = 'slack-watchers'

export const addWatcher = (channel, watchingOn) =>
  connect(async db => {
    const collection = db.collection(collectionName)
    let item = { channel, watchingOn }
    const items = await collection.find({ channel }).toArray()
    if (items.length) {
      await collection.deleteOne({ channel })
      item = {
        ...item,
        watchingOn: uniq([...item.watchingOn, ...items[0].watchingOn])
      }
    }
    await collection.insertOne(item)
    return item
  })

export const getWatchers = () =>
  connect(async db => {
    const collection = db.collection(collectionName)
    return await collection.find({}).toArray()
  })
