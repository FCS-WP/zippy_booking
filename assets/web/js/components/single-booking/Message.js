import { Stack } from '@mui/material'
import React from 'react'

const Message = ({message}) => {

  return (
    <Stack
        direction={"row"}
        sx={{ justifyContent: "center", alignItems: "center", py: 4 }}
    >
        <div>
            <h4>{message}</h4>
        </div>
    </Stack>
  )
}

export default Message