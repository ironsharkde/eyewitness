import SlackBot from 'slackbots'
import { get, last, map } from 'lodash'

import { getUrls } from '../data/urls'
import { getMultipleSiteInfo } from '../data/siteInfo'

const commandPrefix = 'ew'

var defaultParams = {
  icon_emoji: ':eyes:'
  /* icon_url: '' */ // TODO: add custom bot face here
}

const actions = {
  hello: 'hello',
  message: 'message'
}

const commands = {
  urls: 'urls',
  status: 'status'
}

export default function initSlackBot() {
  var bot = new SlackBot({
    token: '',
    name: 'Eyewitness'
  })

  bot.on('start', function() {
    bot.on('message', function(data) {
      // all ingoing events https://api.slack.com/rtm
      // console.log('new DATA: ------> ', data)
      reactions[data.type] && reactions[data.type](data, bot)
    })
  })
}

const reactions = {
  [actions.hello]: () => {
    console.log('slackbot successfully connected and listens to actions 🐶')
  },
  [actions.message]: (data, bot) => {
    const msgRegex = new RegExp(`${commandPrefix} `, 'g')
    const commandRegex = new RegExp(`^${commandPrefix} `, 'g')
    const msg = get(data, 'text', '')
    const isCommand = msg.search(msgRegex) === 0
    if (!isCommand) return

    const cmd = msg.replace(commandRegex, '')
    const cmdParts = cmd.split(' ').filter(x => x.length)
    if (!cmdParts) return

    const command = handlers[cmdParts[0]]
    if (!command) return

    console.warn('command', cmdParts[0])
    command({ parts: cmdParts, data, bot })
  }
}

const handlers = {
  [commands.urls]: async ({ bot, data: { channel } }) => {
    const urls = await getUrls()
    bot.postMessage(channel, urls.map((url, index) => `[${index}] - ${url}\n`).join(''), {
      ...defaultParams
    })
  },

  [commands.status]: async ({ bot, data: { channel } }) => {
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
    bot.postMessage(
      channel,
      sites
        .map(
          ({ url, status, live, error }, index) =>
            `[${index}] ${url} - ${live ? ':white_check_mark:' : ':no_entry_sign:'} ${status ||
              error ||
              ''}\n`
        )
        .join(''),
      {
        ...defaultParams
      }
    )
  }
}
