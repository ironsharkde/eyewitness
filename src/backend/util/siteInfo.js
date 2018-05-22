import request from 'request'
import { mapLimit } from 'async'

const isLive = code => (parseInt(code, 10) < 400 ? true : false)

export const requestMultipleSiteInfo = async urls =>
  await new Promise((resolve, reject) => {
    mapLimit(
      urls,
      3, // = HTTP requests in parallel
      (url, cb) => {
        requestSiteInfo(url).then(result => cb(null, result))
      },
      (err, results) => {
        if (err) console.log(`requestSiteInfo::ERROR ${JSON.stringify(err)}`)
        resolve(results)
      }
    )
  })

export const requestSiteInfo = url =>
  new Promise((resolve, reject) => {
    request({ url, time: true }, function(error, response) {
      const defaultResponse = {
        url,
        live: false,
        timing: null,
        status: null,
        error: null
      }

      if (error) {
        return resolve({
          ...defaultResponse,
          error: error.code
        })
      }

      return resolve({
        ...defaultResponse,
        live: isLive(response.statusCode),
        timing: response.timingPhases,
        status: response.statusCode
      })
    })
  })
