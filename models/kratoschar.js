const mongoose = require('mongoose');

const chai = require('chai');
const assert = chai.assert;
const Schema = mongoose.Schema;

const KratosCharSchema = new Schema({
    name:String,
    mood: String
});

const KratosChar = mongoose.model('kratoschar', KratosCharSchema);

module.exports = KratosChar;