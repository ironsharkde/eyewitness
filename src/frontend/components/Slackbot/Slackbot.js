import React from 'react'
import { adminToken } from '../../../backend/config'

import Log from './Log'
import Control from './Control'
import Help from './Help'

const auth = {
  'x-auth': adminToken
}

export default class Slackbot extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      log: [],
      autoScroll: true,
      showLog: false
    }
    this.fetchLogs = this.fetchLogs.bind(this)
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.setAutoScroll = this.setAutoScroll.bind(this)
    this.toggleLog = this.toggleLog.bind(this)
  }

  componentDidUpdate() {
    const log = document.getElementById('slackbot-log')

    if (this.state.showLog && this.state.autoScroll) {
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

  toggleLog() {
    if (this.state.showLog) {
      clearInterval(this.logInterval)
      this.setState({
        showLog: false
      })
      return
    }
    this.logInterval = setInterval(this.fetchLogs, 3000)
    this.fetchLogs()
    this.setState({
      showLog: true
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
            <div className="slackbot__log-wrapper">
              <button className="slackbot__show-log-button" onClick={this.toggleLog}>
                {!this.state.showLog && '📄 show logs'}
                {this.state.showLog && '📄 hide logs'}
              </button>
              {this.state.showLog && (
                <Log
                  log={this.state.log}
                  autoScroll={this.state.autoScroll}
                  setAutoScroll={this.setAutoScroll}
                />
              )}
            </div>
            <Help />
          </div>
        </div>
      </div>
    )
  }
}
