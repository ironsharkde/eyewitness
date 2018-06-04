import { commandPrefix, defaultParams } from '../config'
import { getUrls } from '../../../data/urls'

export default async function urlsCommand({ bot, channel }) {
  const urls = await getUrls()
  const urlString = urls.map((url, index) => `[${index}] ${url}\n`).join('')
  bot.postMessage(
    channel,
    `>>>
:blue_book: *Available websites*


${urlString}`,
    {
      ...defaultParams
    }
  )
}
