import { connect } from '../util/db'

export const getClients = () =>
  connect(db => {
    var collection = db.collection('clients')
    return collection
      .find({})
      .toArray()
      .then(docs => docs.map(x => ({ token: x.token, name: x.name })))
      .catch(() => [])
  })

export const addClient = (token, name) =>
  connect(async db => {
    const collection = db.collection('clients')
    const item = { token: String(token).trim(), name: String(name).trim() }
    const items = await collection.find(item).toArray()
    if (items.length) {
      return items[0]
    }
    await collection.insertOne(item)
    return item
  })

export const deleteClient = token =>
  connect(async db => {
    const collection = db.collection('clients')
    await collection.deleteOne({ token })
    return collection
      .find({})
      .toArray()
      .then(docs => docs.map(x => ({ token: x.token, name: x.name })))
      .catch(() => [])
  })
