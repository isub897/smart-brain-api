const express = require('express')
const app = express()
var cors = require('cors');
const {ClarifaiStub, grpc} = require("clarifai-nodejs-grpc");

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", "Key 79932e6f391f47c69cb5feec2557b9da");

const users = [
    {
        name: "test",
        email: "test",
        password: "test",
        entries: 2,
        joined: new Date()
    },
    {
        name: "Henry",
        email: "hen@gmail.com",
        password: "jam",
        entries: 4,
        joined: new Date()
    },
    {
        name: "Ann",
        email: "Ann@gmail.com",
        password: "pb",
        entries: 6,
        joined: new Date()
    }
]

app.use(express.json());
app.use(cors());
// app.use(express.urlencoded({ extended: false }));

app.get('/', function (req, res) {
  res.json(users)
})

app.post('/signin', (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {return res.status(400).json('fill')}
    if(email === users[0].email && password === users[0].password) {
        return res.json('success')
    } else {
        return res.status(400).json('failure');
    }  
})

app.post('/register', (req, res) => {
    const {name, email, password, confirm} = req.body;
    if (!name || !email || !password || !confirm) {return res.status(400).json('fill')}
    if(password != confirm) {return res.status(400).json('match')}
    users.push({
        name: name,
        email: email,
        password: password,
        entries: 0,
        joined: new Date()
    });
    return res.json(users[users.length-1]);
})

app.post('/image', (req, res)=> {

    stub.PostModelOutputs(
        {
            // This is the model ID of a publicly available face-detect model. You may use any other public or custom model ID.
            model_id: "a403429f2ddf4b49b307e318f00e528b",
            inputs: [{data: {image: {url: req.body.url}}}]
        },
        metadata,
        // Error response
        (err, response) => {
            if (err || response.status.code !== 10000) {
                res.status(400).json('error')
                return;
            }
            // outputs an object containing the bounding-box paramaters
            res.json(response.outputs[0].data.regions[0].region_info.bounding_box);
        }
    );
})

app.listen(3000)