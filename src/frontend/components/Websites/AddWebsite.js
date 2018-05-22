import React from 'react'
import ReactDOM from 'react-dom'

export default class AddWebsite extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      url: ''
    }
  }

  render() {
    const { onSubmit, onClose } = this.props
    return (
      <div className="add-website">
        <h3 className="add-website__headline">Add website to Eyewitness</h3>
        <input
          type="url"
          autoComplete="off"
          className="add-website__input"
          placeholder="URL"
          value={this.state.url}
          onChange={event => {
            this.setState({
              ...this.state,
              url: event.target.value
            })
          }}
        />
        <button
          className="add-website__submit"
          onClick={() => {
            onSubmit(this.state.url)
            this.setState({
              ...this.state,
              url: ''
            })
          }}
        >
          Add
        </button>
        <button
          className="add-website__cancel"
          onClick={() => {
            onClose()
            this.setState({
              ...this.state,
              url: ''
            })
          }}
        >
          Cancel
        </button>
      </div>
    )
  }
}
