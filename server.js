const express = require('express')
const app = express()
var cors = require('cors');
const {ClarifaiStub, grpc} = require("clarifai-nodejs-grpc");
const knex = require('knex');
const { response } = require('express');
var bcrypt = require('bcryptjs');

const postgres = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port : 5432,
      user : 'postgres',
      password : 'test',
      database : 'smart-brain'
    }
  });


const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", "Key 79932e6f391f47c69cb5feec2557b9da");

const users = [
    {
        id: 1,
        name: "test",
        email: "test",
        password: "test",
        entries: 2,
        joined: new Date()
    },
    {
        id: 2,
        name: "Henry",
        email: "hen@gmail.com",
        password: "jam",
        entries: 4,
        joined: new Date()
    },
    {
        id: 3,
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

    postgres('login').where({
        email: email,
    }).select('hash')
    .then(response=> {
        bcrypt.compare(password, response[0].hash, function(err, result) {
            if(result) {
                postgres('users').where({
                    email: email,
                }).select('*')
                .then(user => {
                    return res.json(user[0])
                })
            } else {
                return res.status(400).json('failure');
            }
        });      
    })
    .catch(err=> res.status(400).json('failure'))
})

app.post('/register', (req, res) => {
    const {name, email, password, confirm} = req.body;
    if (!name || !email || !password || !confirm) {return res.status(400).json('fill')}
    if(password !== confirm) {return res.status(400).json('match')}

    const hash = bcrypt.hashSync(password, 10);


    postgres.transaction(function(trx) {
        postgres('login').transacting(trx)
        .insert({
            email: email,
            hash: hash
        })
          .then(function(resp) {
            postgres('users').transacting(trx)
            .insert({
                name: name,
                email: email,
                joined: new Date()
            })
            .then(response)
          })
          .then(trx.commit)
          .catch(trx.rollback);
      })
      .then(function(resp) {
        postgres('users').where({
            email: email,
          }).select('*')
          .then(user=> res.json(user))
      })
      .catch(function(err) {
        res.status(400).json('Failure');
      });
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