const express = require('express')
const app = express()
var cors = require('cors');
const {ClarifaiStub, grpc} = require("clarifai-nodejs-grpc");
const knex = require('knex');
const { response } = require('express');
var bcrypt = require('bcryptjs');
// const signin = './controllers/SignIn.js';
const signin = require('./controllers/SignIn')
const register = require('./controllers/Register')
const image = require('./controllers/Image')

// knex package to connect backend to database
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

// Clarifai
const stub = ClarifaiStub.grpc();

// Clarifai API Key initialized
const metadata = new grpc.Metadata();
metadata.set("authorization", "Key 79932e6f391f47c69cb5feec2557b9da");

// allow express to interpret json packages and overcome possible CORS issues
app.use(express.json());
app.use(cors());

// the root end-point returns a confirmation
app.get('/', function (req, res) {
    res.json('The server is working')
})
// the end-points 
app.post('/signin', (req, res) => {signin.HandleSignin(req, res, postgres, bcrypt)})
app.post('/register', (req, res) => {register.HandleRegister(req, res, bcrypt, postgres)})
app.post('/image', (req, res)=> {image.HandleImage(req, res, stub, metadata)})
app.put('/image', (req, res)=> {image.HandleCountMessage(req, res, postgres)})

app.listen(3000)