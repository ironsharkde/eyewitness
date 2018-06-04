/* import { connect } from '../../../util/db'

export const addWatcher = channel =>
  connect(async db => {
    const collection = db.collection('slackWatcher')
    const item = { channel: String(token).trim(), name: String(name).trim() }
    const items = await collection.find(item).toArray()
    if (items.length) {
      return items[0]
    }
    await collection.insertOne(item)
    return item
  })
 */
