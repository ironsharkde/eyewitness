import { commandPrefix, defaultParams } from '../config'

export default function helpCommand({ bot, channel }) {
  const allCommandsHelp = [
    `\`${commandPrefix} help\`
Show help information
`,

    `\`${commandPrefix} status\`
Show basic availability data for all registred websites
`,

    `\`${commandPrefix} urls\`
Show list of all registred websites.
_Hint: use the id (in front of website url) of the websites for other commands (e.g. \`details\`)._
`,

    `\`${commandPrefix} details <id> [...<id>]\`
Show site availability details of one or more websites.
_Hint: type \`${commandPrefix} urls\` to see IDs._
`,

    `\`${commandPrefix} watch <id> [...<id>]\`
Eyewitness reports problems for one or more websites.
_Hint: type \`${commandPrefix} urls\` to see IDs._
`,

    `\`${commandPrefix} watch\`
List of all watched websites in current channel.
`,

    `\`${commandPrefix} unwatch\`
Removes watcher from channel.
`
  ]

  const output = `>>>
:information_desk_person: *Eyewitness slack integration*


${allCommandsHelp.join('\n\n')}`

  bot.postMessage(channel, output, {
    ...defaultParams
  })
}
