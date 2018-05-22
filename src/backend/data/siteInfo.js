import { omit, isString } from 'lodash'
import * as config from '../config'
import { connect, prepareStampQuery } from '../util/db'

export const getMultipleSiteInfo = (urls, options) =>
  Promise.all(
    urls.map(async url => ({
      url,
      data: await getSiteInfo(url, options)
    }))
  )

export const getSiteInfo = (url, options) => {
  if (!isString(url)) return Promise.reject()
  let query = prepareStampQuery(options)
  return connect(db => {
    const collection = db.collection(url)
    return collection
      .find(query)
      .toArray()
      .then(results => results.map(x => omit(x, ['_id'])))
  })
}

export const addSiteInfo = ({ url, data }) =>
  connect(async db => {
    const collection = db.collection(url)
    const item = {
      ...data,
      stamp: Date.now()
    }
    await collection.insertOne(item)
    return item
  })

export const deleteSiteInfoByOffset = urls =>
  connect(async db => {
    urls.forEach(async url => {
      const collection = db.collection(url)
      await collection.deleteMany({
        stamp: { $lte: Date.now() - config.limit }
      })
    })
  })

export const addMultipleSiteInfo = siteInfos => Promise.all(siteInfos.map(x => addSiteInfo(x)))
