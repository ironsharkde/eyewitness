import React from 'react'
import ReactDOM from 'react-dom'

import Websites from './components/Websites'
import Clients from './components/Clients'

ReactDOM.render(
  <div>
    <Websites />
    <Clients />
  </div>,
  document.getElementById('app')
)
