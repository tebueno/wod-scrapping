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
// mongoose.connection.close()

getAllLinks = async (model) => {
    let links = [];
    for (i = 221; i <= 399; i++) {
        let value = await getLinks(model, i);
        console.log(value);
        links = links.concat(value);
    }
    return links;
}

const getLinks = async (model, page) => {
    const url = `https://www.crossfitinvictus.com/category/wod/fitness/page/${page}/`;
    const options = {
        uri: url,
        transform: function (body) {
            return cheerio.load(body);
        }
    };
    try {
        const $ = await request(options);
        let links = [];
        $('a.read-more').each((i, element) => {
            links[i] = element.attribs.href;
        });
        return links;
    } catch (err) {
        console.log('this is the catch error: ' + err);
    }
}

getWODz = async (model) => {
    let list = []
    list = await getAllLinks(model);

    for (i = 0, max = list.length; i < max; i++) {
        const options = {
            uri: list[i],
            transform: function (body) {
                return cheerio.load(body);
            }
        };
        try {
        const $ = await request(options);
            let record = {
                link: list[i],
                status: 'success',
                workout: $('div.entry-content').text()
            }
            model.create(record, (err, res) => {
                (err) ? console.log(err): console.log(record);
            });
        } 
        catch(error) {
            console.log('this is the catch error: ' + error);
            let record = {
                link: list[i],
                status: 'failed',
                workout: error
            }
            model.create(record, (err, res) => {
                (err) ? console.log(err): console.log(record);
            });
        }
    }

}


// getWODz();