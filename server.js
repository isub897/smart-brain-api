const express = require('express')
const app = express()

app.get('/', function (req, res) {
  res.send('hows it going g')
})

app.listen(3000)