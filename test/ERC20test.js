const { assertRevert } = require('../helpers/assertRevert');
const expectEvent = require('../helpers/expectEvent');
const utils =  require('../web3util');
const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

setTimeout(() => {
describe.skip('ERC20', () => {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  
  before(() => {
    this.token = erc20;
  });

  describe('total supply', () => {
    it('returns the total amount of tokens', async () => {
      (await this.token.totalSupply()).should.be.bignumber.equal(100);
    });
  });

  describe('balanceOf', () => {
    describe('when the requested account has no tokens', () => {
      it('returns zero', async () => {
        (await this.token.balanceOf(anotherAccount)).should.be.bignumber.equal(0);
      });
    });

    describe('when the requested account has some tokens', () => {
      it('returns the total amount of tokens', async () => {
        var ownerBalance = await this.token.balanceOf(owner).toNumber();
        ownerBalance.should.be.bignumber.equal(100);
      });
    });
  });

  after(async () => {
    var password = "password";
    await utils.lockPersonalAccount(accountAddressList[0],password);
    await utils.lockPersonalAccount(accountAddressList[1],password);
    await utils.lockPersonalAccount(accountAddressList[2],password);
  });
});

run();
}, 8000);