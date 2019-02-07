import React from 'react'
import { Typography } from '@material-ui/core'
import './IndividualMessage.scss'

const IndividualMessage = ({ messageText, senderIsHuman }) =>
  <div className={`IndividualMessage isHuman-${senderIsHuman}`}>
    <Typography >
      {messageText}
    </Typography>
  </div>

export default IndividualMessage