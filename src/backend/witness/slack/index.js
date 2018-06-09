import SlackBot from 'slackbots'
import { get } from 'lodash'

import { slackToken as token } from '../../config'

import { defaultParams, commandPrefix } from './config'
import helpCommand from './commands/help'
import urlsCommand from './commands/urls'
import statusCommand from './commands/status'
import detailsCommand from './commands/details'
import watchCommand from './commands/watch'

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
  watch: 'watch'
}

// TODO: spawn new process for slackbot
export default function initSlackBot() {
  if (!token) {
    console.log('No slack API token defined. Abord slackbot initialization.')
    return
  }

  var bot = new SlackBot({
    token,
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

const joined = (data, bot) => {
  const channel = data.channel.id
  bot.postMessage(channel, `Hello peeps! Type \`${commandPrefix} help\` for more :v:`, {
    ...defaultParams
  })
}

const reactions = {
  [actions.group_joined]: joined,
  [actions.channel_joined]: joined,
  [actions.hello]: (data, bot) => {
    console.log('Slackbot successfully connected. 🐶')
  },
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

const handlers = {
  [commands.help]: helpCommand,
  [commands.urls]: urlsCommand,
  [commands.status]: statusCommand,
  [commands.details]: detailsCommand,
  [commands.watch]: watchCommand
}
