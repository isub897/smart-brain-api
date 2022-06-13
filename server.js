const express = require('express')
const app = express()
var cors = require('cors');
const {ClarifaiStub, grpc} = require("clarifai-nodejs-grpc");

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", "Key 79932e6f391f47c69cb5feec2557b9da");


app.use(express.json());
app.use(cors());
// app.use(express.urlencoded({ extended: false }));

app.get('/', function (req, res) {
  res.json('hows it going g')
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
                res.status(400).json('error uploading image')
                return;
            }
            // outputs an object containing the bounding-box paramaters
            res.json(response.outputs[0].data.regions[0].region_info.bounding_box);
        }
    );
})

app.listen(3000)