import * as dotenv from 'dotenv/config'

import express from 'express'
import bodyParser from 'body-parser'
import { get } from 'lodash'

import * as config from './config'
import { prepareResponse } from './util/api'
import { requestMultipleSiteInfo } from './util/siteInfo'
import {
  addMultipleSiteInfo,
  getMultipleSiteInfo,
  deleteSiteInfoByOffset
} from './data/siteInfo'
import { getUrls, addUrl, deleteUrl } from './data/urls'
import { getClients, addClient, deleteClient } from './data/clients'
import { getLogs as getSlackLogs } from './witness/slack/data/log'

import { startSlackbot, stopSlackbot } from './witness/slack'

const port = process.env.JPR_PORT || 4321
const app = express()

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)

const getRequestIPs = request => {
  const forwardedFor = get(request, 'headers["x-forwarded-for"]')

  return forwardedFor
    ? forwardedFor.split(',').map(x => x.trim())
    : [request.connection.remoteAddress]
}

/**
 * @apiDefine PrettyParam
 * @apiParam {Boolean} [pretty] HTML response for readability
 */

app

  // reject api access if not admit or registred client
  .use('/api', async (req, res, next) => {
    const path = get(req, '_parsedUrl.pathname', '')
    const queryToken = get(req, 'query.token', false)
    const token = get(req, 'headers["x-auth"]', false)
    const hasAccess = token === config.adminToken

    if (hasAccess) {
      next()
      return
    } else if (path.indexOf('/api/v1/siteInfo') !== -1) {
      const clients = await getClients()
      const hasClientAccess = clients.map(x => x.token).indexOf(queryToken) !== -1
      if (hasClientAccess) {
        next()
        return
      }
    }

    const requestIps = getRequestIPs(req)
    console.log(`access denied for ${requestIps.join(',')}`)

    res.status('403').send(prepareResponse(req.query, 'access forbidden'))
  })

  .get('/api/v1/slackbot/start', (req, res) => {
    startSlackbot()
    res.status('200').send(prepareResponse(req.query, { message: 'Start Slackbot requested' }))
  })

  .get('/api/v1/slackbot/stop', (req, res) => {
    stopSlackbot()
    res.status('200').send(prepareResponse(req.query, { message: 'Stop Slackbot requested' }))
  })

  .get('/api/v1/slackbot/logs', async (req, res) => {
    const logs = await getSlackLogs()
    res.status('200').send(prepareResponse(req.query, logs))
  })

  /**
   * @api {get} /urls get urls
   * @apiName GetUrls
   * @apiGroup Urls
   * @apiVersion 1.0.0
   * @apiHeader {String} x-auth access key
   *
   * @apiUse PrettyParam
   *
   * @apiSuccess {Array} response list of urls
   *
   * @apiSuccessExample Success-Response:
   *    HTTP/1.1 200 OK
   *    [
   *      "http://ironshark.de",
   *      "http://isdev.de"
   *    ]
   */
  .get('/api/v1/urls', async (req, res) => {
    try {
      const urls = await getUrls()
      res.status('200').send(prepareResponse(req.query, urls))
    } catch (error) {
      res.status('500').send(prepareResponse(req.query, error))
    }
  })

  /**
   * @api {post} /url add url
   * @apiName AddUrl
   * @apiGroup Urls
   * @apiVersion 1.0.0
   * @apiHeader {String} x-auth access key
   *
   * @apiSuccess {String} response added url
   *
   * @apiParam {Object}   body        request body
   * @apiParam {String}   body.url    url to add
   *
   * @apiSuccessExample Success-Response:
   *    HTTP/1.1 200 OK
   *    "http://ironshark.de"
   */
  .post('/api/v1/url', async (req, res) => {
    try {
      const url = await addUrl(req.body.url)
      res.status('200').send(prepareResponse(req.query, url))
    } catch (error) {
      res.status('500').send(prepareResponse(req.query, error))
    }
  })

  /**
   * @api {delete} /url delete url
   * @apiName DeleteUrl
   * @apiGroup Urls
   * @apiVersion 1.0.0
   * @apiHeader {String} x-auth access key
   *
   * @apiSuccess {String} response urls
   *
   * @apiParam {Object}   body        request body
   * @apiParam {String}   body.url    url to delete
   *
   * @apiSuccessExample Success-Response:
   *    HTTP/1.1 200 OK
   *    [
   *      "http://ironshark.de",
   *      "http://isdev.de"
   *    ]
   */
  .delete('/api/v1/url', async (req, res) => {
    try {
      const urls = await deleteUrl(req.body.url)
      res.status('200').send(prepareResponse(req.query, urls))
    } catch (error) {
      res.status('500').send(prepareResponse(req.query, error))
    }
  })

  /**
   * @api {get} /clients get clients
   * @apiName GetClients
   * @apiGroup Clients
   * @apiVersion 1.0.0
   * @apiHeader {String} x-auth access key
   *
   * @apiUse PrettyParam
   *
   * @apiSuccess {Array} response         list of clients
   * @apiSuccess {String} response.name   name of client
   * @apiSuccess {Array} response.token   access token
   *
   * @apiSuccessExample Success-Response:
   *    HTTP/1.1 200 OK
   *    [
   *      {
   *        "name": "my client",
   *        "token": "bafcs6366cas636bcadf"
   *      }
   *    ]
   */
  .get('/api/v1/clients', async (req, res) => {
    try {
      const clients = await getClients()
      res.status('200').send(prepareResponse(req.query, clients))
    } catch (error) {
      res.status('500').send(prepareResponse(req.query, error))
    }
  })

  /**
   * @api {post} /client add client
   * @apiName AddClient
   * @apiGroup Clients
   * @apiVersion 1.0.0
   * @apiHeader {String} x-auth access key
   *
   * @apiSuccess {String} response added client
   *
   * @apiParam {Object}   body          request body
   * @apiParam {String}   body.name     name of client
   * @apiParam {String}   body.token    access token
   *
   * @apiSuccessExample Success-Response:
   *    HTTP/1.1 200 OK
   *    {
   *      "name": "my client",
   *      "token": "bafcs6366cas636bcadf"
   *    }
   */
  .post('/api/v1/client', async (req, res) => {
    try {
      const client = await addClient(req.body.token, req.body.name)
      res.status('200').send(prepareResponse(req.query, client))
    } catch (error) {
      res.status('500').send(prepareResponse(req.query, error))
    }
  })

  /**
   * @api {delete} /client delete client
   * @apiName DeleteClient
   * @apiGroup Clients
   * @apiVersion 1.0.0
   * @apiHeader {String} x-auth access key
   *
   * @apiSuccess {String} response clients
   *
   * @apiParam {Object}   body        request body
   * @apiParam {String}   body.token  client token
   *
   * @apiSuccessExample Success-Response:
   *    HTTP/1.1 200 OK
   *    [
   *      {
   *        "name": "my client",
   *        "token": "bafcs6366cas636bcadf"
   *      }
   *    ]
   */
  .delete('/api/v1/client', async (req, res) => {
    try {
      const clients = await deleteClient(req.body.token)
      res.status('200').send(prepareResponse(req.query, clients))
    } catch (error) {
      res.status('500').send(prepareResponse(req.query, error))
    }
  })

  /**
   * @api {get} /siteInfo get site infos
   * @apiName GetSiteInfo
   * @apiGroup siteInfo
   * @apiVersion 1.0.0
   * @apiHeader {String} [x-auth] access key
   *
   * @apiUse PrettyParam
   *
   * @apiParam {Number}   [from]                filter output by date from (in ms)
   * @apiParam {Number}   [to=Date.now()]       filter output by date to (in ms)
   * @apiParam {Number}   [fromOffset=28800000] filter output by date from now minus the value (in ms) default 8h
   * @apiParam {String}   [token]               client access token (not needed when x-auth header is set)
   *
   * @apiSuccess {Array}    response                            list of websites
   * @apiSuccess {Object}   response.site                       website object
   * @apiSuccess {Strong}   response.site.url                   website url
   * @apiSuccess {Array}    response.site.data                  list of website info objects
   * @apiSuccess {String}   response.site.data.url              website url
   * @apiSuccess {Number}   response.site.data.stamp            timestamp in ms
   * @apiSuccess {Boolean}  response.site.data.live             is website live (no error; code not >= 400)
   * @apiSuccess {Number}   response.site.data.status           response status code
   * @apiSuccess {String}   response.site.data.error            response error
   * @apiSuccess {Object}   response.site.data.timing           website response timing object
   * @apiSuccess {Number}   response.site.data.timing.wait      in ms
   * @apiSuccess {Number}   response.site.data.timing.dns       in ms
   * @apiSuccess {Number}   response.site.data.timing.tcp       in ms
   * @apiSuccess {Number}   response.site.data.timing.firstByte in ms
   * @apiSuccess {Number}   response.site.data.timing.download  in ms
   * @apiSuccess {Number}   response.site.data.timing.total     in ms
   *
   *
   * @apiSuccessExample Success-Response:
   *    HTTP/1.1 200 OK
   *    [
   *      {
   *        "url": "http://ironshark.de",
   *        "data": [
   *          {
   *            "url": "http://ironshark.de",
   *            "live": true,
   *            "timing": {
   *              "wait": 0.7692990005016327,
   *              "dns": 0.645857997238636,
   *              "tcp": 149.851916000247,
   *              "firstByte": 74.94785900041461,
   *              "download": 60.15044999867678,
   *              "total": 286.36538199707866
   *            },
   *            "status": 200,
   *            "error": null,
   *            "stamp": 1522299297735
   *          }
   *        ]
   *      }
   *    ]
   *
   */
  .get('/api/v1/siteInfo', async (req, res) => {
    try {
      const q = req.query
      const options = {
        from: get(q, 'from', false),
        to: get(q, 'to', Date.now()),
        fromOffset: get(q, 'fromOffset', config.fromOffset)
      }
      const siteInfos = await getMultipleSiteInfo(await getUrls(), options)
      res.status('200').send(prepareResponse(req.query, siteInfos))
    } catch (error) {
      res.status('500').send(prepareResponse(req.query, error))
    }
  })

  .use('/', (req, res, next) => {
    const requestIps = getRequestIPs(req)

    const { accessIps } = config
    const hasAccess = accessIps.length === 0 || accessIps.some(x => requestIps.includes(x))

    if (hasAccess) {
      return next()
    } else {
      console.log(`access denied for IP ${requestIps.join(',')}`)
    }

    res.status('403').send(prepareResponse(req.query, 'access forbidden'))
  })

  .use('/', express.static('public'))

  .listen(port, function() {
    console.log(`👁 serve @ localhost:${port}`)
  })

// fetch site info every [config.density] ms
async function updateSiteInfo() {
  const urls = await getUrls()
  const siteInfo = await requestMultipleSiteInfo(urls)
  await addMultipleSiteInfo(
    siteInfo.map(siteInfo => ({
      url: siteInfo.url,
      data: siteInfo
    }))
  )
  await deleteSiteInfoByOffset(urls)
  setTimeout(updateSiteInfo, config.density)
}
updateSiteInfo()

// START SLACKBOT
startSlackbot()
