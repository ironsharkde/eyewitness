import { get, findIndex } from 'lodash'
import SlackBot from 'slackbots'

import { slackToken as token } from '../../config'
import { defaultParams, commandPrefix } from './config'

import helpCommand from './commands/help'
import urlsCommand from './commands/urls'
import statusCommand from './commands/status'
import detailsCommand from './commands/details'
import watchCommand from './commands/watch'
import unwatchCommand from './commands/unwatch'

import { getWatchers } from './data/watch'
import { getUrls } from '../../data/urls'

const actions = {
  hello: 'hello',
  message: 'message',
  group_joined: 'group_joined',
  channel_joined: 'channel_joined'
}

const commands = {
  help: 'help',
  urls: 'urls',
  status: 'status',
  details: 'details',
  watch: 'watch',
  unwatch: 'unwatch'
}

const handlers = {
  [commands.help]: helpCommand,
  [commands.urls]: urlsCommand,
  [commands.status]: statusCommand,
  [commands.details]: detailsCommand,
  [commands.watch]: watchCommand,
  [commands.unwatch]: unwatchCommand
}

const joined = (data, bot) => {
  const channel = data.channel.id
  bot.postMessage(channel, `Hello peeps! Type \`${commandPrefix} help\` for more :v:`, {
    ...defaultParams
  })
  console.log(`joined to channel: ${data.channel.name}`)
}

const hello = (data, bot) => {
  console.log(`Slackbot successfully connected.`)
}

const reactions = {
  [actions.group_joined]: joined,
  [actions.channel_joined]: joined,
  [actions.hello]: hello,
  [actions.message]: (data, bot) => {
    const commandRegex = new RegExp(`${commandPrefix} `, 'g')
    const msg = get(data, 'text', '')
    const isCommand = msg.search(commandRegex) === 0
    if (!isCommand) return

    const commandPartsRegex = new RegExp(`^${commandPrefix} `, 'g')
    const cmd = msg.replace(commandPartsRegex, '')
    const cmdParts = cmd.split(' ').filter(x => x.length)
    if (!cmdParts) {
      return
    }

    const command = handlers[cmdParts[0]]
    if (!command) {
      bot.postMessage(
        data.channel,
        `
> :zany_face: well.. something's not right with \`${commandPrefix} ${cmdParts.join(' ')}\`
>
> ~ _Type \`${commandPrefix} help\` for more info!_`
      )
      return
    }

    command({ parts: cmdParts, data, bot, channel: data.channel })
  }
}

function startSlackBot() {
  console.log(`Start Slackbot ...`)

  var bot = new SlackBot({
    token,
    name: 'Eyewitness'
  })

  bot.on('error', error => {
    throw error
  })

  bot.on('start', async () => {
    getWatchers().then(async watchers => {
      watchers.forEach(async watcher => {
        const urls = await getUrls()
        const channel = watcher.channel
        const pageIds = watcher.watchingOn.map(url => findIndex(urls, x => x === url))
        const parts = ['watch', ...pageIds.map(x => `${x}`)]
        watchCommand({ parts, bot, channel, reinit: true })
      })

      const channelIds = watchers.map(watcher => watcher.channel)

      const activeGroups = await bot
        .getGroups()
        .then(groups => groups.groups)
        .catch(e => {
          throw e
        })
        .then(groups => (groups ? groups : []))
      const activeChannels = await bot
        .getChannels()
        .then(channels => channels.channels)
        .catch(e => {
          throw e
        })
        .then(channels => (channels ? channels : []))

      const chats = [].concat(activeGroups, activeChannels)
      const activeChats = chats.filter(chat => channelIds.indexOf(chat.id) !== -1)

      console.log(
        `${watchers.length} Watcher${
          watchers.length > 1 ? 's' : ''
        } started in these channels: ${activeChats.map(x => x.name).join(', ')}`
      )
    })

    bot.on('message', data => {
      reactions[data.type] && reactions[data.type](data, bot)
    })
  })
}

startSlackBot()
