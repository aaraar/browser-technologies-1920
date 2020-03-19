const app = require('express')();
const bodyParser = require('body-parser');
require('dotenv').config();
const port = process.env.PORT || 3000;
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_SERVER}/bt1920?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});

client.connect(err => {
    // res.render(data.state, {title: `Vraag ${data.state.substring(1)}`, uuid: data.uuid});
    const collection = client.db("bt1920").collection("users");
    app.set('view engine', 'pug');
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());

    app.get('/', (req, res) => {
        res.render('index', {title: 'WebDev Enquete', existingUuid: false})
    });

    app.get('/begin', (req, res) => {
        res.render('404', {
            title: '404 | Webdev Enquete',
            content: 'Sorry ik kreeg geen unieke code mee, kun je via de <a href="/">homepage</a> met de enquete beginnen?'
        });
    });

    app.post('/begin', (req, res) => {
        if (req.body.uuid) {
            collection.findOne({uuid: req.body.uuid})
                .then(data => {
                    if (data) {
                        if (data[data.state]) {
                            res.render(data.state, {title: `Vraag ${data.state.substring(1)}`, uuid: data.uuid, data: data[data.state]});
                        }
                        else res.render(data.state, {title: `Vraag ${data.state.substring(1)}`, uuid: data.uuid});
                    }
                    else {
                        collection.insertOne(
                            {uuid: req.body.uuid, state: "q1"}
                        ).then(res.render('q1', {title: 'Vraag 1 | WebDev Enquete', uuid: req.body.uuid}));
                    }
                })
                .catch(err => {
                    console.error(err);
                });
        } else {
            res.render('404', {
                title: '404 | Webdev Enquete',
                content: 'Sorry ik kreeg geen unieke code mee, kun je via de <a href="/">homepage</a> met de enquete beginnen'
            })
        }
    });

    app.post('/question', (req, res) => {
        if (req.body.uuid) {
            collection.updateOne(
                {uuid: req.body.uuid},
                {
                    $set: {
                        state: req.body.q,
                        [req.body.q]: {
                            grade: req.body.grade,
                            desc: req.body.desc,
                        }
                    }
                },
                {upsert: true})
                .then(
                    collection.findOne({uuid: req.body.uuid}).then(data => {
                        let q;
                        if (req.body.action === 'Volgende vraag') q = nextQ(req.body.q);
                        else if(req.body.action === 'Vorige vraag') q = prevQ(req.body.q);
                        if (data[q]) {
                            res.render(q,
                                {
                                    title: `Vraag ${q} | WebDev Enquete`,
                                    uuid: req.body.uuid,
                                    data: data[q]
                                })
                        } else {
                            res.render(q,
                                {
                                    title: `Vraag ${q} | WebDev Enquete`,
                                    uuid: req.body.uuid,
                                })
                        }
                    })
                )
                .catch(err => {
                    console.error(err);
                });
        }
    });

    app.post('/back', (req, res) => {
        if (req.body.uuid) {
            collection.findOne({uuid: req.body.uuid})
                .then(data => {
                    res.render(req.body.q, {
                        title: `Vraag ${req.body.q[1]} | WebDev Enquete`,
                        uuid: req.body.uuid,
                        data: data[req.body.q]
                    });
                })
        }
    });

    app.use(function (req, res, next) {
        res.status(404).render('404', {
            title: '404 | Webdev Enquete'
        });
    });

    app.listen(port, () => console.log(`Example app listening on port ${port}!`));
});

function nextQ(q) {
    return q[0] + (parseInt(q[1]) + 1)
}

function prevQ(q) {
    return q[0] + (parseInt(q[1]) - 1)
}

