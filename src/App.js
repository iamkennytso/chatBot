import React, { Component } from 'react';
import './App.css';

const INITIAL_STATE = {
  mess: ''
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  };

  componentDidMount () {
    this.setState({ mess:'world' })
  };

  render() {

    return (
      <div className="App">
        Hello {this.state.mess}
      </div>
    );
  }
}

export default App;
