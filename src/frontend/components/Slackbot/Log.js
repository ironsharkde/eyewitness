import React from 'react'
import moment from 'moment'

export default function Log({ log, autoScroll, setAutoScroll }) {
  return (
    <section className="slackbot__section">
      <h3 className="slackbot__sub-headline">Logs</h3>
      <label className="slackbot__autoscroll">
        <input
          type="checkbox"
          checked={autoScroll}
          onChange={e => {
            setAutoScroll(e.currentTarget.checked)
          }}
        />{' '}
        auto scroll
      </label>
      <pre className="slackbot__log" id="slackbot-log">
        {log.map(({ stamp, type, message }) => (
          <span key={stamp} className={`slackbot__log-line slackbot__log-line--${type}`}>
            <span className="slackbot__log-stamp">{moment(stamp).format('HH:mm:ss')}]</span>{' '}
            {message}
          </span>
        ))}
      </pre>
    </section>
  )
}
