const should = require('chai')
  .should();

// async function assertRevert (promise) {
//   try {
//     var result = await promise;
//   } catch (error) {
//     // console.log('Error message ' + JSON.stringify(error))
//     error.message.should.include('revert', `Expected "revert", got ${error} instead`);
//     return;
//   }
//   should.fail('Expected revert not received');
// }

async function assertRevert (result) {

  if(!Object.keys(result).length){

    var test = (0).should.be.bignumber.equal(0)

    var result1 = 'revert';

    var abc = result1.message.should.include('revert', `Expected "revert", got ${error} instead`);
    return;
  }

  should.fail('Expected revert not received');
}

module.exports = {
  assertRevert,
};
