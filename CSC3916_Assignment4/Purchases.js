var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

mongoose.Promise = global.Promise;

try {
    mongoose.connect( process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected - purch"));
}catch (error) {
    console.log("could not connect - purch");
}
mongoose.set('useCreateIndex', true);

//purchase schema
var PurchaseSchema = new Schema({
    order_number: {type: Number, required: true, index: { unique: true }},
    product_id: {type: Number, required: true},
    name: {type: String, required: true},
    address: {type: String, required: true},
    cc: {type: String, required: true},
    euro_price: {type: Number, required: true},
    region_currency: {type: String, required: true},
    region_price: {type: Number, required: true}
});

PurchaseSchema.pre('save', function(next) {
    var p = this;
    next();
});

//return the model to server
module.exports = mongoose.model('Purchase', PurchaseSchema);
