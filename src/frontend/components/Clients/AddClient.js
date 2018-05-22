import React from 'react'
import ReactDOM from 'react-dom'

export default class AddClient extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      token: '',
      name: ''
    }
  }

  render() {
    const { addClient } = this.props

    return (
      <div>
        <h3 className="clients__sub-headline">Add a Client</h3>
        <div className="add-client">
          <input
            type="text"
            className="add-client__name"
            value={this.state.name}
            onChange={evt => {
              this.setState({ name: evt.target.value })
            }}
            placeholder="Client Name"
          />
          <input
            type="text"
            className="add-client__token"
            value={this.state.token}
            onChange={evt => {
              this.setState({ token: evt.target.value })
            }}
            placeholder="Token"
          />
          <button
            className="add-client__submit"
            onClick={() => {
              if (this.state.name.trim().length && this.state.token.trim().length) {
                addClient(this.state.name, this.state.token)
                this.setState({
                  token: '',
                  name: ''
                })
              }
            }}
          >
            Add Client
          </button>
        </div>
      </div>
    )
  }
}
