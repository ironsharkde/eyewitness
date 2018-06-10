import { spawn } from 'child_process'
import { slackToken as token } from '../../config'
import { addLog } from './data/log'

let slackbot = null

export const startSlackbot = () => {
  if (slackbot) {
    const line = '🤖 Slackbot already started.'
    console.log(line)
    addLog(line, 'warn')
    return
  }

  if (!token) {
    const line = '🤖 No slack API token defined in config. Abord slackbot initialization.'
    console.log(line)
    addLog(line, 'error')
    return
  }

  // spawn new process for bot
  slackbot = spawn('node', [`${__dirname}/slackbot.js`])

  slackbot.stdout.on('data', data => {
    const line = `🤖 ${data}`
    console.log(line)
    addLog(line)
  })

  slackbot.stderr.on('data', data => {
    const line = `🤖 (╯°□°）╯︵ ┻━┻  [ERROR]

${data}`
    console.log(line)
    addLog(line, 'error')
  })

  slackbot.on('close', code => {
    const line = `🤖 Slackbot stopped with code ${code}`
    console.log(line)
    addLog(line)
  })
}

export const stopSlackbot = () => {
  if (!slackbot) {
    const line = '🤖 Slackbot not running.'
    console.log(line)
    addLog(line, 'warn')
    return
  }

  slackbot.kill('SIGSTOP')
  slackbot = null
  const line = `🤖 Slackbot killed`
  console.log(line)
  addLog(line)
}
