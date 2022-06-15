const HandleRegister = (req, res, bcrypt, postgres) => {

    const {name, email, password, confirm} = req.body;
    if (!name || !email || !password || !confirm) {return res.status(400).json('fill')}
    if(password !== confirm) {return res.status(400).json('match')}

    const hash = bcrypt.hashSync(password, 10);

    // database transaction to insert information into 'users' and 'login' databases
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
            .then(response=>response)
          })
          .then(trx.commit)
          .catch(trx.rollback);
      })
      //if the transaction is successful, select the user we just created, and return it as a response to be used for front end purposes (NOTE: we DO NOT return the password lol)
      .then(function(resp) {
        postgres('users').where({
            email: email,
          }).select('*')
          .then(user=> res.json(user[0]))
      })
      .catch(function(err) {
        res.status(400).json('Failure');
      });

}

module.exports = {
    HandleRegister: HandleRegister
}