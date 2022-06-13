const express = require('express')
const app = express()

app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

app.get('/', function (req, res) {
  res.json('hows it going g')
})

app.post('/image', (req, res)=> {
    console.log(req.body)
    res.json(req.body)
})

app.listen(3000)