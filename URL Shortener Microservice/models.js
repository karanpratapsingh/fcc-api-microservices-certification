const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UrlTypes = new Schema ({
  url : {type: String, required: true},
  index : {type: Number, required: true}
});

module.exports.UrlTypes = mongoose.model('UrlTypes', UrlTypes);

let Counters = new Schema ({
  count : {type: Number, default: 1}
});

module.exports.Counters = mongoose.model('Counters', Counters);