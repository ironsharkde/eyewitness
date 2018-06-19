import { commandPrefix, defaultParams } from '../config'
import { removeWatcher } from '../data/watch'

export default async function unwatchCommand({ bot, channel }) {
  await removeWatcher(channel)
  return bot.postMessage(channel, `> :robot_face: Removed watcher for this channel.`, {
    ...defaultParams
  })
}
