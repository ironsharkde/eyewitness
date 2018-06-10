import React from 'react'
import { adminToken } from '../../../backend/config'

import Log from './Log'
import Control from './Control'

const auth = {
  'x-auth': adminToken
}

export default class Slackbot extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      log: [],
      autoScroll: true
    }
    this.fetchLogs = this.fetchLogs.bind(this)
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.setAutoScroll = this.setAutoScroll.bind(this)

    setInterval(this.fetchLogs, 3000)
    this.fetchLogs()
  }

  componentDidUpdate() {
    const log = document.getElementById('slackbot-log')

    if (this.state.autoScroll) {
      log.scrollTop = log.scrollHeight
    }
  }

  fetchLogs() {
    const request = new Request(`api/v1/slackbot/logs`, {
      headers: new Headers({
        ...auth
      })
    })
    fetch(request)
      .then(x => x.json())
      .then(log => {
        this.setState({
          log
        })
      })
  }

  start() {
    const request = new Request(`api/v1/slackbot/start`, {
      headers: new Headers({
        ...auth
      })
    })
    fetch(request)
  }

  stop() {
    const request = new Request(`api/v1/slackbot/stop`, {
      headers: new Headers({
        ...auth
      })
    })
    fetch(request)
  }

  setAutoScroll(enabled) {
    this.setState({
      autoScroll: enabled
    })
  }

  render() {
    return (
      <div className="slackbot__wrapper">
        <h2 className="slackbot__headline">
          <img className="slackbot__icon" src="images/slack.svg" /> Slackbot
        </h2>
        <div className="slackbot">
          <div className="slackbot__inner">
            <Control start={this.start} stop={this.stop} />
            <Log
              log={this.state.log}
              autoScroll={this.state.autoScroll}
              setAutoScroll={this.setAutoScroll}
            />
          </div>
        </div>
      </div>
    )
  }
}
