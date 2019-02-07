import React, { Component } from 'react';
import { TextField, Button } from '@material-ui/core';
import firebase from '../../constants/firebase';
import Logo from './Cedrus.jfif';
import './Login.scss';

const INITIAL_STATE = {
  username: '',
  password: '',
  mess: "Don't be a stranger",
}

class loginDiv extends Component {
  /**
   * Initializers 
   */

  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  };
  /**
   * Handlers 
   */

  _handleLogin = async e => {
    e.preventDefault();
    try {
      const user = await firebase.auth().signInWithEmailAndPassword(this.state.username, this.state.password);
      this.props.handleLogin(user);
    } catch(err) {
      if (
        err.code === 'auth/invalid-email' || 
        err.code === 'auth/wrong-password' || 
        err.code === 'auth/too-many-requests'
      ) {
        this._handleInvalid();
      } else {
        console.error(err)
      }
    }
  };

  _handleChange = field => event =>
    this.setState({
      [field]: event.target.value,
    });

  _handleInvalid = () => {
    this.setState({
      mess: this.state.mess[0] === 'N'
        ? this.state.mess.concat('!')
        : 'NO'
    });
  };
  /**
   * Renderer
   */

  render() {
    return (
      <div className="Login" >
        <div className='Login-Name'> Demo Chatbox </div>
        <img className='Login-Logo' src={Logo} alt="Cedrus" /> <br />
        <div className='Login-Message'> {this.state.mess} </div>
        <form className='Login-Form' onSubmit={this._handleLogin}>
          <TextField className='Login-Field' onChange={this._handleChange('username')} fullWidth autoFocus />
          <TextField className='Login-Field' onChange={this._handleChange('password')} fullWidth type="password" />
          <Button className='Login-Button' variant="contained" fullWidth color="primary" type="submit"> Login </Button>
        </form>
      </div>
    );
  }
}

export default loginDiv;