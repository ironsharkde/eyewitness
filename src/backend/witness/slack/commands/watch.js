import { compact, last } from 'lodash'

import { commandPrefix, defaultParams } from '../config'
import { getUrls } from '../../../data/urls'
import { getMultipleSiteInfo } from '../../../data/siteInfo'
import { addWatcher, getWatchers } from '../data/watch'

const getData = async pageIds => {
  const urls = await getUrls()
  const allSites = await getMultipleSiteInfo(urls, {
    fromOffset: 24 * 60 * 60 * 1000,
    withId: true
  })
  const sites = compact(pageIds.map(x => allSites[parseInt(x)]))
  return sites
}

const watcher = async ({ bot, channel, data, pageIds }) => {
  const oldData = data

  const watchers = await getWatchers()
  const currentChannelWatcher = watchers.find(x => x.channel === channel)

  if (
    !currentChannelWatcher ||
    !currentChannelWatcher.watchingOn ||
    !currentChannelWatcher.watchingOn.length
  ) {
    return
  }

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

export default async function watchCommand({ parts: [cmd, ...pageIds], bot, channel, reinit }) {
  // no pageIds given, check for watcher in this channel and give feedback about it
  if (!pageIds.length && !reinit) {
    const watchers = await getWatchers()
    const currentChannelWatcher = watchers.find(x => x.channel === channel)

    if (
      !currentChannelWatcher ||
      !currentChannelWatcher.watchingOn ||
      !currentChannelWatcher.watchingOn.length
    ) {
      return bot.postMessage(
        channel,
        `
> :robot_face: This channel is not watching on anything.`,
        {
          ...defaultParams
        }
      )
    }
    return bot.postMessage(
      channel,
      `
> :robot_face: This channel watches on:
>   • ${currentChannelWatcher.watchingOn.join('\n>   • ')}`,
      {
        ...defaultParams
      }
    )
  }

  const data = await getData(pageIds)

  if (!data.length) {
    return bot.postMessage(
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
  }

  const watchingOn = data.map(x => x.url)

  addWatcher(channel, watchingOn).then(d => {
    watcher({ bot, channel, data, pageIds })
  })

  if (reinit) {
    return bot.postMessage(
      channel,
      `
> :robot_face: Eyewitness Watcher restarted.
>
> Still watching on:
>   • ${watchingOn.join('\n>   • ')}`,
      {
        ...defaultParams
      }
    )
  }

  bot.postMessage(
    channel,
    `
> :ok_hand: Check! Watching on:
>   • ${watchingOn.join('\n>   • ')}
>
> I'll ping this channel when somethings going on with these sites.`,
    {
      ...defaultParams
    }
  )
}
