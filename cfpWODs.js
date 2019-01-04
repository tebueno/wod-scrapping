var request = require('request-promise');
var mongoose = require('mongoose');
moment = require('moment');

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

getWODz = async (model) => {
    let today = new Date();
    for (i = 644, max = 2000; i < max; i++) {
        let date = moment(today).subtract(i, 'days').format('YYYY-MM-DD').toString();


        const options = {
            uri: `https://api.beyondthewhiteboard.com/api/webwidgets/gyms/wodsets?date=${date}&tracks=1&gym_id=&sections=Main&wod_types=Workout&days=&leaderboard_length=3&activity_length=0&api_key=b0ca07ea27f4f15ddee49d9d2a73bf20`,
            transform: function (body) {
                return JSON.parse(body);
            }
        }
        try {
            const json = await request(options);
            let record = {
                link: `Crossfit Pleasanton: ${date}`,
                status: 'success',
                workout: json.wodsets[0].wods[0].workout_description
            }
            model.create(record, (err, res) => {
                (err) ? console.log(err): console.log(record);
            });
        } catch (error) {
            let record = {
                link: `Crossfit Pleasanton: ${date}`,
                status: 'failed',
                workout: error
            }
            model.create(record, (err, res) => {
                (err) ? console.log(err): console.log(record);
            });
        }
    }
}
