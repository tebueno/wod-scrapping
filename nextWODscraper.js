var request = require('request-promise');
var cheerio = require('cheerio');
var mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1/db');
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    let wodSchema = new mongoose.Schema({
        link: String,
        status: String,
        workout: String
    });

    let wodModel = mongoose.model('wodModel', wodSchema)
    getWODz(wodModel);
});

const getWODz = async (model) => {
    let linkList = [];
    for (let j = 21; j <= 135; j++) {
        const links = await getLinks(j);
        linkList = linkList.concat(links);
    }
    for (i = 0, max = linkList.length; i < max; i++) {
        const url = linkList[i];
        const options = {
            uri: url,
            transform: function (body) {
                return cheerio.load(body);
            }
        };
        try {
            const $ = await request(options);
            let record = {
                link: linkList[i],
                status: 'success',
                workout: $('section.entry-content').text()
            }
            console.log(record);
            model.create(record, (err, res) => {
                (err) ? console.log(err): console.log(record);
            });
        } catch (err) {
            console.log('this is the catch error: ' + err);
            let record = {
                link: linkList[i],
                status: 'failed',
                workout: error
            }
            model.create(record, (err, res) => {
                (err) ? console.log(err): console.log(record);
            });
        }
    }
}

const getLinks = async (page) => {
    const url = `https://crossfitnyc.com/category/3-competition/page/${page}/`;
    const options = {
        uri: url,
        transform: function (body) {
            return cheerio.load(body);
        }
    };
    try {
        const $ = await request(options);
        let links = [];
        $('h2.entry-title > a').each((i, element) => {
            links[i] = element.attribs.href;
        });
        return links;
    } catch (err) {
        console.log('this is the catch error: ' + err);
    }
}