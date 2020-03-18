const app = require ( 'express' ) ();
const bodyParser = require ( 'body-parser' );
require ( 'dotenv' ).config ();
const port = process.env.PORT || 3000;
const MongoClient = require ( 'mongodb' ).MongoClient;
const uri = `mongodb+srv://${ process.env.MONGODB_USER}:${ process.env.MONGODB_PASSWORD }@${ process.env.MONGODB_SERVER }/bt1920?retryWrites=true&w=majority`;
const client = new MongoClient ( uri, { useNewUrlParser: true } );

client.connect ( err => {
    // res.render(data.state, {title: `Vraag ${data.state.substring(1)}`, uuid: data.uuid});
    const collection = client.db ( "bt1920" ).collection ( "users" );
    app.set ( 'view engine', 'pug' );
    app.use ( bodyParser.urlencoded ( { extended: false } ) );
    app.use ( bodyParser.json () );
    
    app.get ( '/', ( req, res ) => {
        res.render ( 'index', { title: 'WebDev Enquete', existingUuid: false } )
    } );
    
    app.get ( '/begin', ( req, res ) => {
        res.render('404', {title: '404 | Webdev Enquete', content: 'Sorry ik kreeg geen unieke code mee, kun je via de <a href="/">homepage</a> met de enquete beginnen'});
    });
    
    app.post ( '/begin', ( req, res ) => {
        if (req.body.uuid) {
            collection.findOne ( { uuid: req.body.uuid } )
                .then ( data => {
                    if ( data ) res.render(data.state, {title: `Vraag ${data.state.substring(1)}`, uuid: data.uuid});
                    else {
                        collection.insertOne (
                            { uuid: req.body.uuid, state: "q1" }
                        ).then ( res.render ( 'q1', { title: 'Vraag 1 | WebDev Enquete', uuid: req.body.uuid } ) );
                    }
                } )
                .catch ( err => {
                    console.error ( err );
                } );
        }
        else {
            res.render('404', {title: '404 | Webdev Enquete', content: 'Sorry ik kreeg geen unieke code mee, kun je via de <a href="/">homepage</a> met de enquete beginnen'})
        }
    } );
    app.post ( '/answer', (req, res) => {
        if (req.body.uuid) {
            collection.findOne ( { uuid: req.body.uuid } )
                .then ( data => {
                    if ( data ) res.send ( data );
                    else {
                        collection.insertOne (
                            { uuid: req.body.uuid, state: "q1" }
                        ).then ( res.render ( 'q1', { title: 'Vraag 1 | WebDev Enquete', uuid: req.body.uuid } ) );
                    }
                } )
                .catch ( err => {
                    console.error ( err );
                } );
        }
    });
    
    app.listen ( port, () => console.log ( `Example app listening on port ${ port }!` ) );
} );

