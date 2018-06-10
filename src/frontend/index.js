import React from 'react'
import ReactDOM from 'react-dom'

import Websites from './components/Websites'
import Clients from './components/Clients'
import Slackbot from './components/Slackbot'

ReactDOM.render(
  <div>
    <Websites />
    <Clients />
    <Slackbot />
  </div>,
  document.getElementById('app')
)
