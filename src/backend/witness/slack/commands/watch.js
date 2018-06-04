import { compact, get, last } from 'lodash'

import { commandPrefix, defaultParams } from '../config'
import { getUrls } from '../../../data/urls'
import { getMultipleSiteInfo } from '../../../data/siteInfo'

const getData = async pageIds => {
  const urls = await getUrls()
  const allSites = await getMultipleSiteInfo(urls, {
    fromOffset: 24 * 60 * 60 * 1000,
    withId: true
  })
  const sites = compact(pageIds.map(x => allSites[parseInt(x)]))
  return sites
}

const watcher = ({ bot, channel, data, pageIds }) => {
  const oldData = data
  setTimeout(async () => {
    const newData = await getData(pageIds)
    newData.forEach((site, i) => {
      const record = last(site.data)

      // is live
      if (record.live) {
        // was not live
        if (!last(oldData[i].data).live) {
          bot.postMessage(
            channel,
            `>>>
:green_heart: ${record.url} *All-clear!* It's up again.
\`\`\` STATUS: ${record.status || 'n/a'} \`\`\``,
            {
              ...defaultParams
            }
          )
        }
        return
      }

      // is not live
      // was not live
      if (!last(oldData[i].data).live) {
        return
      }

      bot.postMessage(
        channel,
        `>>>
:red_circle: ${record.url} *Attention!* One should check whats going on there.
\`\`\` ERROR: ${record.status || record.error || 'n/a'} \`\`\``,
        {
          ...defaultParams
        }
      )
    })

    watcher({ bot, channel, data: newData, pageIds })
  }, 10 * 1000)
}

export default async function watchCommand({ parts: [cmd, ...pageIds], bot, channel }) {
  const data = await getData(pageIds)

  if (!data.length) {
    bot.postMessage(
      channel,
      `
> :zany_face: well.. something's not right with:
> \`${commandPrefix} ${cmd} ${pageIds.join(' ')}\`
>
> Please give one or more valid IDs (e.g. \`${commandPrefix} watch 2 5 9\`)
> ~ _Btw, you can type \`${commandPrefix} urls\` to see IDs._`,
      {
        ...defaultParams
      }
    )
    return
  }

  const watchingOn = data.map(x => x.url)
  bot.postMessage(
    channel,
    `
> :ok_hand: Check! Watching on:
> • ${watchingOn.join('\n> • ')}
>
> I'll ping this channel when somethings going on with these sites.`,
    {
      ...defaultParams
    }
  )

  watcher({ bot, channel, data, pageIds })
}
