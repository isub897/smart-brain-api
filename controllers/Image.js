const HandleImage = (req, res, stub, metadata) => {

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
}

const HandleCountMessage = (req, res, postgres) => {

    // find the associated user in the 'users' table using their email.  Update entries in the table.  Return that entries number (ie. 4) as a response to the front end to be used.
    const {email, entries} = req.body;
    postgres('users')
    .where({ email: email })
    .update({ 
        entries: entries 
    }, ['entries'])
    .then(response=> res.json(response[0].entries))
    .catch(err=> res.status(400).json(err))
}

module.exports = {
    HandleImage: HandleImage,
    HandleCountMessage: HandleCountMessage
}