import React from 'react'
import { 
  Card, 
  CardMedia, 
  CardContent,
  CardActions,
  Button,
  Typography,
} from '@material-ui/core';
import './MessageCard.scss'

const MessageCard = ({ data }) => 
  <Card className='MessageCard'>
    <CardMedia
      component="img"
      alt={data.title}
      image={data.imageUri}
      title={data.title}
      height='330'
    />
    <CardContent>
      <Typography gutterBottom variant="h5" component="h2">
        {data.title}
      </Typography>
      <Typography component="p">
        {data.subtitle}
      </Typography>
    </CardContent>
    <CardActions>
      <Button size="small" color="primary" onClick={() => window.open(data.buttons[0].postback, '_blank')} >
        {data.buttons[0].text}
      </Button>
    </CardActions>
  </Card>

export default MessageCard