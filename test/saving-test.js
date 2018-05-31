const chai = require('chai');
const assert = chai.assert;
const KratosChar = require('../models/kratoschar')

describe('Saving records', function(){
    //create tests

    it('Saves a record to the database', (done) =>{

        var char = new KratosChar({
            name:'Kratos',
            mood: 'Jovial'
        });
        //save method is asyncronous and returns a promise to wait for the save to finish
        char.save().then(function(){
            assert(char.isNew === false);
            done();
        })
    });

    //next test
});