import React from 'react'

export default function Help() {
  return (
    <section className="slackbot__section">
      <h3 className="slackbot__sub-headline">All Slackbot Commands</h3>
      <ul>
        <li className="slackbot__help-item">
          <code className="slackbot__help-code">ey, help</code>
          <br />
          Show help information
        </li>
        <li className="slackbot__help-item">
          <code className="slackbot__help-code">ey, status</code>
          <br />
          Show basic availability data for all registred websites.
        </li>
        <li className="slackbot__help-item">
          <code className="slackbot__help-code">ey, urls</code>
          <br />
          show list of all registred websites.<br />
          <i>
            Hint: use the id (in front of website url) of the websites for other commands (e.g.{' '}
            <code className="slackbot__help-code">details</code>).
          </i>
        </li>
        <li className="slackbot__help-item">
          <code className="slackbot__help-code">
            ey, details {'<id>'} [...{'<id>'}]
          </code>
          <br />
          Show site availability details of one or more websites.<br />
          <i>
            Hint: type <code className="slackbot__help-code">ey, urls</code> to see IDs.
          </i>
        </li>
        <li className="slackbot__help-item">
          <code className="slackbot__help-code">
            ey, watch {'<id>'} [...{'<id>'}]
          </code>
          <br />
          Eyewitness reports problems for one or more websites.<br />
          <i>
            Hint: type <code className="slackbot__help-code">ey, urls</code> to see IDs.
          </i>
        </li>
        <li className="slackbot__help-item">
          <code className="slackbot__help-code">ey, watch</code>
          <br />
          List all watched websites.
        </li>
        <li className="slackbot__help-item">
          <code className="slackbot__help-code">ey, unwatch</code>
          <br />
          Removes watcher from channel.
        </li>
      </ul>
    </section>
  )
}
