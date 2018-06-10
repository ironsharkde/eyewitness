import { commandPrefix, defaultParams } from '../config'
import { getUrls } from '../../../data/urls'

export default async function urlsCommand({ bot, channel }) {
  const urls = await getUrls()
  const urlString = urls.map((url, index) => `[${index}] ${url}\n`).join('')

  if (!urls.length) {
    return bot.postMessage(
      channel,
      `>>>
:zany_face: *Eyewitness not watching any Websites*

_~ Please go to the Eyewitness page and add some websites to watch._`,
      {
        ...defaultParams
      }
    )
  }

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
