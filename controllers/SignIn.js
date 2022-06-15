const HandleSignin = (req, res, postgres, bcrypt) => {
    
    const {email, password} = req.body;
    // if one of the input fields are empty, we return an error message that prompt's the user in the front end to complete both fields
    if (!email || !password) {return res.status(400).json('fill')}

    // check in the login table to see if email exists, if yes, get the password-hash
    postgres('login').where({
        email: email,
    }).select('hash')
    // compare the password given upon signin with the password hash stored in the database using bcrypt, if successful, return the user as a response to be used in the front end, otherwise return an error message 
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
}

module.exports = {
    HandleSignin: HandleSignin
}