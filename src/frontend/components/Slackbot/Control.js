import React from 'react'

export default function Control({ start, stop }) {
  return (
    <section className="slackbot__section">
      <button className="slackbot__start-button" onClick={start}>
        Start
      </button>
      <button className="slackbot__stop-button" onClick={stop}>
        Stop
      </button>
    </section>
  )
}
