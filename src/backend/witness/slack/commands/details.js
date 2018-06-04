import { get, last, isNil, compact } from 'lodash'

import { commandPrefix, defaultParams } from '../config'
import { getUrls } from '../../../data/urls'
import { getMultipleSiteInfo } from '../../../data/siteInfo'
import { getAverage, getStandardDeviation } from '../../../util/average'

const getData = async pageIds => {
  const urls = await getUrls()
  const allSites = await getMultipleSiteInfo(urls, {
    fromOffset: 24 * 60 * 60 * 1000
  })
  const sites = compact(pageIds.map(x => allSites[parseInt(x)]))
  return sites
}

export default async function detailsCommand({ parts: [cmd, ...pageIds], bot, channel }) {
  const data = await getData(pageIds)

  if (!data.length) {
    bot.postMessage(
      channel,
      `
> :zany_face: well.. something's not right with: \`${commandPrefix} ${cmd} ${pageIds.join(
        ' '
      )}\`
>
> Please give one or more valid IDs (e.g. \`${commandPrefix} details 2 5 9\`)
> ~ _Btw, you can type \`${commandPrefix} urls\` to see IDs._`,
      {
        ...defaultParams
      }
    )
    return
  }

  const details = data.map(site => {
    const { url, live, status, error } = last(site.data)

    // TODO: this metrik stuff is shamelessly copied from frontend/components/Websites/Website.js
    // we should centralize it someday
    const averageTiming = {
      tcp: getAverage(site.data.map(x => get(x, 'timing.tcp', 0))),
      firstByte: getAverage(site.data.map(x => get(x, 'timing.firstByte', 0))),
      total: getAverage(site.data.map(x => get(x, 'timing.total', 0)))
    }

    const allMetric = site.data.map(x => get(x, 'timing.firstByte', 0))
    const standardDeviation = getStandardDeviation(allMetric)
    const average = getAverage(allMetric)

    const downtimeEntries = site.data.filter(x => !x.live).length
    const spikesEntries = site.data.filter(
      x => (x.live ? get(x, 'timing.firstByte', 0) >= average + standardDeviation : false)
    ).length
    const uptimeEntries = site.data.length - downtimeEntries - spikesEntries

    const uptimeMetrik = {
      live: uptimeEntries / site.data.length * 100.0,
      spikes: spikesEntries / site.data.length * 100.0,
      down: downtimeEntries / site.data.length * 100.0
    }

    const lines = [
      `> ${live ? ':green_heart:' : ':red_circle:'} ${url} \`${
        live ? 'STATUS:' : 'ERROR:'
      } ${status || error || 'n/a'}\``,
      '> ',
      '> *Average availability (last 24h):*',
      '> ```',
      `live:      ${uptimeMetrik.live.toFixed(2)}%`,
      `spikes:    ${uptimeMetrik.spikes.toFixed(2)}%`,
      `down:      ${uptimeMetrik.down.toFixed(2)}%`,
      '```',
      '> *Average timing (last 24h):*',
      '> ```',
      `tcp:       ${Math.round(averageTiming.tcp)}ms`,
      `firstByte: ${Math.round(averageTiming.firstByte)}ms`,
      `total:     ${Math.round(averageTiming.total)}ms`,
      '```',
      ''
    ]

    return lines.join('\n')
  })

  bot.postMessage(channel, details.join('\n'), {
    ...defaultParams
  })
}
