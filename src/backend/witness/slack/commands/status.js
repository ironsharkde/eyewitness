import { last } from 'lodash'

import { commandPrefix, defaultParams } from '../config'
import { getUrls } from '../../../data/urls'
import { getMultipleSiteInfo } from '../../../data/siteInfo'

export default async function statusCommand({ bot, channel }) {
  const urls = await getUrls()
  const sites = await getMultipleSiteInfo(urls, {
    fromOffset: 10 * 60 * 1000
  }).then(sites =>
    sites.map(({ url, data }) => {
      return {
        ...last(data)
      }
    })
  )
  const urlString = sites
    .map(
      ({ url, status, live, error }, index) =>
        `
${live ? ':green_heart:' : ':red_circle:'} ${url} \` ${live ? 'STATUS:' : 'ERROR:'} ${status ||
          error ||
          'n/a'} \``
    )
    .join('\n')
  bot.postMessage(
    channel,
    `>>>
:bar_chart: *Current status*


${urlString}`,
    {
      ...defaultParams
    }
  )
}
