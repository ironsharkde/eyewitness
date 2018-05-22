import { connect } from '../util/db'

export const getUrls = () =>
  connect(db => {
    var collection = db.collection('urls')
    return collection
      .find({})
      .toArray()
      .then(docs => docs.map(x => x.url))
      .catch(() => [])
  })

export const addUrl = url =>
  connect(async db => {
    const collection = db.collection('urls')
    const item = { url: String(url) }
    const items = await collection.find(item).toArray()
    if (items.length) {
      return items[0]
    }
    await collection.insertOne(item)
    return item
  })

export const deleteUrl = url =>
  connect(async db => {
    const collection = db.collection('urls')
    await collection.deleteOne({ url })
    return collection
      .find({})
      .toArray()
      .then(docs => docs.map(x => x.url))
      .catch(() => [])
  })
