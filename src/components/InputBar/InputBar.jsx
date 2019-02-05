import React from 'react'
import { TextField, Button } from '@material-ui/core'
import { Send } from '@material-ui/icons'
import './InputBar.scss'

const InputBar = ({}) => 
  <div className='InputBar'>
    <TextField
      className='InputBar-Input'
      fullWidth
    />
    <Button variant="contained" color="default" type="submit">
      Send
      <Send />
    </Button>
  </div>


export default InputBar