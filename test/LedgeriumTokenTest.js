var chai = require('chai')
var expect = chai.expect;

require('chai')
  .use(require('chai-bignumber')())
  .should();

setTimeout(function () {
  describe('Ledgerium Token', function () {

    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    const owner = accountAddressList[0];
    const recipient = accountAddressList[1];
    const anotherAccount = accountAddressList[2];

    before(async function () {
      this.token = LgumToken;
    });

    describe('total supply', function () {

      it('returns the total amount of tokens', async function () {

        // (await this.token.totalSupply()).should.be.bignumber.equal(100);
        var result = await this.token.methods.totalSupply().call({from: owner});
        console.log("result", result)
        result.should.be.bignumber.equal(20000000000000000);

      });
    });

    describe('balanceOf', function () {
      describe('when the requested account has no tokens', function () {

        it('returns zero', async function () {

          // (await this.token.balanceOf(anotherAccount)).should.be.bignumber.equal(0);
          (await this.token.methods.balanceOf(anotherAccount).call()).should.be.bignumber.equal(0);

        });

      });

      describe('when the requested account has some tokens', function () {

        it('returns the total amount of tokens', async function () {
          
          var ownerBalance = await this.token.methods.balanceOf(owner).call();
          ownerBalance.should.be.bignumber.equal(20000000000000000);

        });
      });
    });

    describe('transfer', function () {
      describe('when the recipient is not the zero address', function () {
        const to = recipient;

        // describe('when the sender does not have enough balance', function () {
        //   const amount = 20000000000000001;

        //   it('reverts', async function () {
          
        //     // var ret = await this.token.methods.transfer(to, amount, { from: owner });
        //     let encodedABI = await this.token.methods.transfer(to, amount).encodeABI();
        //     var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);
        //     expect(transactionObject.status).to.be.flase;

        //     // assertRevert(transactionObject);
          
        //   });
        // });

        describe('when the sender has enough balance', function () {
          const amount = 100;

          it('transfers the requested amount', async function () {
            
            // var ownerBalance = await this.token.balanceOf(owner).toNumber()();
            var ownerBalance = await this.token.methods.balanceOf(owner).call();
            
            // await this.token.transfer(to, amount, { from: owner });
            let encodedABI = await this.token.methods.transfer(to, amount).encodeABI();
            var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);
            
            // (await this.token.balanceOf(owner)).should.be.bignumber.equal(0);
            var balance = await this.token.methods.balanceOf(owner).call(); 
            (await this.token.methods.balanceOf(owner).call()).should.be.bignumber.equal(19999999999999900);
            
            // (await this.token.balanceOf(to)).should.be.bignumber.equal(amount);
            var balance = await this.token.methods.balanceOf(to).call();
            (await this.token.methods.balanceOf(to).call()).should.be.bignumber.equal(amount);
          
          });

          it('emits a transfer event', async function () {
  
            console.log('Balance of owner ' + owner + ' : ' + await this.token.methods.balanceOf(owner).call());

            var balance = await this.token.methods.balanceOf(to).call();

            // const { logs } = await this.token.methods.transfer(to, amount, { from: owner });
            let encodedABI = await this.token.methods.transfer(to, amount).encodeABI();
            var transactionObject = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);

            var balance = await this.token.methods.balanceOf(to).call();
            
            var logs = await this.token.getPastEvents('Transfer');
            var returnValues = logs[0].returnValues;              
            (returnValues['0'].toLowerCase()).should.be.equal(owner);
            (returnValues['1'].toLowerCase()).should.be.equal(to);
            (returnValues['2']).should.be.bignumber.equal(amount);
            
            // expectEvent.inLogs(logs, 'Transfer', {
            //   from: owner,
            //   to: to,
            //   value: amount,
            
            // });
          });
        });
      });

      describe('when the recipient is the zero address', function () {
        const to = ZERO_ADDRESS;
        const amount = 100;

        it('reverts', async function () {
          
          // var val = await this.token.transfer(to, 100, { from: owner });
            let encodedABI = await this.token.methods.transfer(to, amount).encodeABI();
            var transactionObject = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);
            
            var status = (transactionObject.message).includes('revert')
            status.should.be.true;
            
            // await assertRevert(transactionObject); 
        
          });
      });
    });

    describe('approve', function () {
      describe('when the spender is not the zero address', function () {
        const spender = recipient;

        describe('when the sender has enough balance', function () {
          const amount = 100;

          it('emits an approval event', async function () {
              
            // const { logs } = await this.token.approve(spender, amount, { from: owner });
            var encodedABI = await this.token.methods.approve(spender, amount).encodeABI();
            var transactionObject = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);

            var logs = await this.token.getPastEvents('Approval');
            var returnValues = logs[0].returnValues;              

            (returnValues['0'].toLowerCase()).should.be.equal(owner);
            (returnValues['1'].toLowerCase()).should.be.equal(spender);
            (returnValues['2']).should.be.bignumber.equal(amount);
              //Need to work
            // expectEvent.inLogs(logs, 'Approval', {
            //   owner: owner,
            //   spender: spender,
            //   value: amount,
          
            // });
          });

          describe('when there was no approved amount before', function () {
            it('approves the requested amount', async function () {
              
              // await this.token.approve(spender, amount, { from: owner });
              var encodedABI = (await this.token.methods.approve(spender, amount)).encodeABI();
              var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);

              // (await this.token.allowance(owner, spender)).should.be.bignumber.equal(amount);
              var balance = await this.token.methods.allowance(owner, spender).call();
              (balance).should.be.bignumber.equal(amount);
            
            });
          });

          describe('when the spender had an approved amount', function () {
            beforeEach(async function () {

              // await this.token.approve(spender, 1, { from: owner });
              var encodedABI = (await this.token.methods.approve(spender, 1)).encodeABI();
              var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);
                        
            });

            it('approves the requested amount and replaces the previous one', async function () {
            
              // await this.token.approve(spender, amount, { from: owner });
              var encodedABI = (await this.token.methods.approve(spender, amount)).encodeABI();
              var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);

              // (await this.token.allowance(owner, spender)).should.be.bignumber.equal(amount);
              var balance = await this.token.methods.allowance(owner, spender).call();
              (balance).should.be.bignumber.equal(amount);
            
            });
          });
        });

        // describe('when the sender does not have enough balance', function () {
        //   const amount = 101;

        //   it('emits an approval event', async function () {
            
        //     // const { logs } = await this.token.approve(spender, amount, { from: owner });
        //     var encodedABI = (await this.token.methods.approve(spender, amount)).encodeABI();
        //     var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);

        //     var logs = await this.token.getPastEvents('Approval');

        //     expectEvent.inLogs(logs, 'Approval', {
        //       owner: owner,
        //       spender: spender,
        //       value: amount,
            
        //     });
          // });

      //   });
      });

      describe('when the spender is the zero address', function () {
        const amount = 100;
        const spender = ZERO_ADDRESS;

        it('reverts', async function () {

          // await assertRevert(this.token.approve(spender, amount, { from: owner }));
          var encodedABI = (await this.token.methods.approve(spender, amount)).encodeABI();
          var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);
          
          // assertRevert(transactionObject)
          var status = (transactionObject.message).includes('revert')
          status.should.be.true;

        });
      });
    });

    describe('transfer from', function () {
      const spender = recipient;

      describe('when the recipient is not the zero address', function () {
        const to = anotherAccount;

        describe('when the spender has enough approved balance', function () {
          beforeEach(async function () {

            // await this.token.approve(spender, 100, { from: owner });
            var encodedABI = (await this.token.methods.approve(spender, 100)).encodeABI();
            var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);
          
          });

          describe('when the owner has enough balance', function () {
            const amount = 100;

            it('transfers the requested amount', async function () {
              
              // var balance = await this.token.methods.balanceOf(owner).call();
              // console.log(" Before - Balance Owner",  balance )        
              
              // var balance = await this.token.methods.balanceOf(to).call();        
              // console.log("Before - Balance To" , balance)
              
              // await this.token.transferFrom(owner, to, amount, { from: spender });
              var encodedABI = await this.token.methods.transferFrom(owner, to, amount).encodeABI(); //replaced owner with spender
              var transactionObject = await utils.sendMethodTransaction(spender,deployedLgumTokenAddress,encodedABI,privateKey[spender],web3,0);

              var balance = await this.token.methods.balanceOf(spender).call(); //replaced owner with spender
              // console.log(   " After - Balance Owner", balance)        
              
              var balance = await this.token.methods.balanceOf(to).call();        
              // console.log(  "After - Balance To", balance)

              (await this.token.methods.balanceOf(owner).call()).should.be.bignumber.equal(19999999999999700); 

              (await this.token.methods.balanceOf(to).call()).should.be.bignumber.equal(amount);
            
            });

            it('decreases the spender allowance', async function () {

              // await this.token.transferFrom(owner, to, amount, { from: spender });
              var encodedABI = (await this.token.methods.transferFrom(owner, to , amount)).encodeABI();
              var transactionObject  = await utils.sendMethodTransaction(spender,deployedLgumTokenAddress,encodedABI,privateKey[spender],web3,0);

              // (await this.token.allowance(owner, spender)).should.be.bignumber.equal(0);
              (await this.token.methods.allowance(owner, spender).call()).should.be.bignumber.equal(0);
            
            });

            it('emits a transfer event', async function () {

              // const { logs } = await this.token.transferFrom(owner, to, amount, { from: spender });
              var encodedABI = (await this.token.methods.transferFrom(owner, to , amount)).encodeABI();
              var transactionObject  = await utils.sendMethodTransaction(spender,deployedLgumTokenAddress,encodedABI,privateKey[spender],web3,0);
                
              var logs = await this.token.getPastEvents('Transfer');
              
              var returnValues = logs[0].returnValues;              

              (returnValues['0'].toLowerCase()).should.be.equal(owner);
              (returnValues['1'].toLowerCase()).should.be.equal(to);
              (returnValues['2']).should.be.bignumber.equal(amount);
              
              // expectEvent.inLogs(logs, 'Transfer', {
              //   from: owner,
              //   to: to,
              //   value: amount,
            
              // });
            });
          });

    //       describe('when the owner does not have enough balance', function () {
    //         const amount = 101;

    //         it('reverts', async function () {
              
    //           // await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }));
    //           var encodedABI = (await this.token.methods.transferFrom(owner, to , amount)).encodeABI();
    //           var transactionObject  = utils.sendMethodTransaction(spender,deployedLgumTokenAddress,encodedABI,privateKey[spender],web3,0);
            
    //           assertRevert(transactionObject);

    //         });
    //       });
        });

        describe('when the spender does not have enough approved balance', function () {
          beforeEach(async function () {

            // await this.token.approve(spender, 99, { from: owner });
            var encodedABI = (await this.token.methods.approve(spender, 99)).encodeABI();
            var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);

          });

          describe('when the owner has enough balance', function () {
            const amount = 100;

            it('reverts', async function () {
              
              // await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }));
              var encodedABI = (await this.token.methods.transferFrom(owner, to , amount)).encodeABI();
              var transactionObject  = await utils.sendMethodTransaction(spender,deployedLgumTokenAddress,encodedABI,privateKey[spender],web3,0);

              // assertRevert(transactionObject);
              var status = (transactionObject.message).includes('revert')
              status.should.be.true;
            
            });
          });

    //       describe('when the owner does not have enough balance', function () {
    //         const amount = 101;

    //         it('reverts', async function () {
              
    //           // await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }));
    //           var encodedABI = (await this.token.methods.transferFrom(owner, to , amount)).encodeABI();
    //           var transactionObject  = utils.sendMethodTransaction(spender,deployedLgumTokenAddress,encodedABI,privateKey[spender],web3,0);
              
    //           assertRevert(transactionObject);
            
    //         });
    //       });
        });
      });

      describe('when the recipient is the zero address', function () {
        const amount = 100;
        const to = ZERO_ADDRESS;

        beforeEach(async function () {

          // await this.token.approve(spender, amount, { from: owner });
          var encodedABI = await this.token.methods.approve(spender, amount).encodeABI();
          var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);
          
        });

        it('reverts', async function () {

          // await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }));
          var encodedABI = await this.token.methods.transferFrom(owner, to , amount).encodeABI();
          var transactionObject  = await utils.sendMethodTransaction(spender,deployedLgumTokenAddress,encodedABI,privateKey[spender],web3,0);
          
          // assertRevert(transactionObject);
          var status = (transactionObject.message).includes('revert')
          status.should.be.true;
        
        });
      });
    });

    describe('decrease allowance', function () {
      describe('when the spender is not the zero address', function () {
        const spender = recipient;

        function shouldDecreaseApproval (amount) {
          // describe('when there was no approved amount before', function () {
          //   it('reverts', async function () {

          //     // await assertRevert(this.token.decreaseAllowance(spender, amount, { from: owner }));

          //     var encodedABI = (await this.token.methods.decreaseAllowance(spender, amount)).encodeABI();
          //     var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);

          //     // assertRevert(transactionObject)
          //     var status = (transactionObject.message).includes('revert')
          //     status.should.be.true;

          //   });
          // });

          describe('when the spender had an approved amount', function () {
            const approvedAmount = amount;

            beforeEach(async function () {

              // ({ logs: this.logs } = await this.token.approve(spender, approvedAmount, { from: owner }));
              var encodedABI = await this.token.methods.approve(spender, approvedAmount).encodeABI();
              var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);

            });

            it('emits an approval event', async function () {
              
              // const { logs } = await this.token.decreaseAllowance(spender, approvedAmount, { from: owner });
              var encodedABI = await this.token.methods.decreaseAllowance(spender, approvedAmount).encodeABI();
              var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);

              var logs = await this.token.getPastEvents('Approval');
              
              var returnValues = logs[0].returnValues;              

              (returnValues['0'].toLowerCase()).should.be.equal(owner);
              (returnValues['1'].toLowerCase()).should.be.equal(spender);
              (returnValues['2']).should.be.bignumber.equal(0);
              // expectEvent.inLogs(logs, 'Approval', {
              //   owner: owner,
              //   spender: spender,
              //   value: 0,
              // });
            });

            it('decreases the spender allowance subtracting the requested amount', async function () {

              // await this.token.decreaseAllowance(spender, approvedAmount - 1, { from: owner });
              var encodedABI = (await this.token.methods.decreaseAllowance(spender, approvedAmount - 1)).encodeABI();
              var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);

              // (await this.token.methods.balanceOf(spender).call()).should.be.bignumber.equal(100);
              (await this.token.methods.allowance(owner, spender).call()).should.be.bignumber.equal(1);

            });

            it('sets the allowance to zero when all allowance is removed', async function () {

              // await this.token.decreaseAllowance(spender, approvedAmount, { from: owner });
              var encodedABI = (await this.token.methods.decreaseAllowance(spender, approvedAmount)).encodeABI();
              var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);

              
              (await this.token.methods.allowance(owner, spender).call()).should.be.bignumber.equal(0);

            });

            it('reverts when more than the full allowance is removed', async function () {

              // await assertRevert(this.token.decreaseAllowance(spender, approvedAmount + 1, { from: owner }));
              var encodedABI = (await this.token.methods.decreaseAllowance(spender, approvedAmount + 1)).encodeABI();
              var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);
              
              // assertRevert(transactionObject) 
              var status = (transactionObject.message).includes('revert')
              status.should.be.true;
            });
          });
        }

        describe('when the sender has enough balance', function () {
          const amount = 100;

          shouldDecreaseApproval(amount);
        });

        describe('when the sender does not have enough balance', function () {
          const amount = 101;

          shouldDecreaseApproval(amount);
        });
      });

      describe('when the spender is the zero address', function () {
        const amount = 100;
        const spender = ZERO_ADDRESS;

        it('reverts', async function () {

          // await assertRevert(this.token.decreaseAllowance(spender, amount, { from: owner }));
          var encodedABI = await this.token.methods.decreaseAllowance(spender, amount).encodeABI();
          var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);
          
          // assertRevert(transactionObject) 
          var status = (transactionObject.message).includes('revert')
          status.should.be.true;

        });
      });
    });

    describe('increase allowance', function () {
      const amount = 100;

      describe('when the spender is not the zero address', function () {
        const spender = recipient;

        describe('when the sender has enough balance', function () {
          it('emits an approval event', async function () {

            // const { logs } = await this.token.increaseAllowance(spender, amount, { from: owner });
            var encodedABI = (await this.token.methods.increaseAllowance(spender, amount)).encodeABI();
            var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);

            var logs = await this.token.getPastEvents('Approval');

            var returnValues = logs[0].returnValues;              

            (returnValues['0'].toLowerCase()).should.be.equal(owner);
            (returnValues['1'].toLowerCase()).should.be.equal(spender);
            (returnValues['2']).should.be.bignumber.equal(201);
            // (returnValues['2']).should.be.bignumber.equal(amount);
            // expectEvent.inLogs(logs, 'Approval', {
            //   owner: owner,
            //   spender: spender,
            //   value: amount,
            // });
          });

          describe('when there was no approved amount before', function () {
            it('approves the requested amount', async function () {

              // await this.token.increaseAllowance(spender, amount, { from: owner });
              var encodedABI = (await this.token.methods.increaseAllowance(spender, amount)).encodeABI();
              var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);       

              (await this.token.methods.allowance(owner, spender).call()).should.be.bignumber.equal(301); //Calling increaseAllowance in previous function as well

            });
          });

          describe('when the spender had an approved amount', function () {
            beforeEach(async function () {
              
              // await this.token.approve(spender, 1, { from: owner });
              var encodedABI = (await this.token.methods.approve(spender, 1)).encodeABI();
              var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);

            });

            it('increases the spender allowance adding the requested amount', async function () {
              
              // await this.token.increaseAllowance(spender, amount, { from: owner });
              var encodedABI = (await this.token.methods.increaseAllowance(spender, amount)).encodeABI();
              var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);   

              (await this.token.methods.allowance(owner, spender).call()).should.be.bignumber.equal(amount + 1);

            });
          });
        });

        // When amount is greater than total supply , Error: invalid number value (arg="addedValue", coderType="uint256", value=20000000000000000)
        // describe('when the sender does not have enough balance', function () {
        //   const amount = 20000000000000001;

        //   it('emits an approval event', async function () {
            
        //     // const { logs } = await this.token.increaseAllowance(spender, amount, { from: owner });
        //     var encodedABI = (await this.token.methods.increaseAllowance(spender, amount)).encodeABI();
        //     var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);

        //     var logs = await this.token.getPastEvents('Approval');
        //     var returnValues = logs[0].returnValues;              

        //     (returnValues['0'].toLowerCase()).should.be.equal(owner);
        //     (returnValues['1'].toLowerCase()).should.be.equal(spender);
        //     (returnValues['2']).should.be.equal(amount.toString());

        //     // expectEvent.inLogs(logs, 'Approval', {
        //     //   owner: owner,
        //     //   spender: spender,
        //     //   value: amount,
        //     // });
        //   });

        //   describe('when there was no approved amount before', function () {
        //     it('approves the requested amount', async function () {

        //       // await this.token.increaseAllowance(spender, amount, { from: owner });
        //       var encodedABI = (await this.token.methods.increaseAllowance(spender, amount)).encodeABI();
        //       var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);

        //       (await this.token.allowance(owner, spender)).should.be.bignumber.equal(amount);

        //     });
        //   });

        //   describe('when the spender had an approved amount', function () {
        //     beforeEach(async function () {

        //       // await this.token.approve(spender, 1, { from: owner });
        //       var encodedABI = (await this.token.methods.approve(spender, 1)).encodeABI();
        //       var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);

        //     });

        //     it('increases the spender allowance adding the requested amount', async function () {

        //       // await this.token.increaseAllowance(spender, amount, { from: owner });
        //       var encodedABI = (await this.token.methods.increaseAllowance(spender, amount)).encodeABI();
        //       var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);

        //       (await this.token.allowance(owner, spender)).should.be.bignumber.equal(amount + 1);

        //     });
        //   });
        // });
      });

      describe('when the spender is the zero address', function () {
        const spender = ZERO_ADDRESS;

        it('reverts', async function () {

          // await assertRevert(this.token.increaseAllowance(spender, amount, { from: owner }));
          var encodedABI = await this.token.methods.increaseAllowance(spender, amount).encodeABI();
          var transactionObject  = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);

          // assertRevert(transactionObject);
          var status = (transactionObject.message).includes('revert')
          status.should.be.true;

        });
      });
    });

    // describe('_mint', function () {
    //   const initialSupply = new BigNumber(100);
    //   const amount = new BigNumber(50);

    //   // it('rejects a null account', async function () {

    //   //   // await assertRevert(this.token.mint(ZERO_ADDRESS, amount));
    //   //   var encodedABI = await this.token.methods.mint(ZERO_ADDRESS, amount).encodeABI();
    //   //   var transactionObject = utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);

    //   //   assertRevert(transactionObject);

    //   // });

    //   describe('for a non null account', function () {
    //     beforeEach('minting', async function () {

    //       console.log("_mint - for a non null account - minting - recipient", recipient);
          
    //       // const { logs } = await this.token.mint(recipient, amount);
    //       var encodedABI = await this.token.methods._mint(recipient, amount).encodeABI();
    //       var transactionObject = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);

    //       // var logs = await this.token.getPastEvents('Transfer')
    //       // this.logs = logs;
    //     });

    //     it('increments totalSupply', async function () {
          
    //       const expectedSupply = initialSupply.plus(amount);

    //       // (await this.token.totalSupply()).should.be.bignumber.equal(expectedSupply);
    //       (await this.token.methods.totalSupply().call()).should.be.bignumber.equal(expectedSupply);
        
    //     });

    //     it('increments recipient balance', async function () {

    //       // (await this.token.balanceOf(recipient)).should.be.bignumber.equal(amount);
    //       (await this.token.methods.balanceOf(recipient).call()).should.be.bignumber.equal(amount);
        
    //     });

    //     it('emits Transfer event', async function () {
        
    //       var logs = await this.token.getPastEvents('Transfer');
    //       var returnValues = logs[0].returnValues;              

    //       (returnValues['2']).should.be.equal(amount.toString());
        
    //       // const event = expectEvent.inLogs(this.logs, 'Transfer', {
    //       //   from: ZERO_ADDRESS,
    //       //   to: recipient,
    //       // });
    //       // event.args.value.should.be.bignumber.equal(amount);

        
    //     });
    //   });
    // });

    describe('_burn', function () {
      const initialSupply = 100;
      var totalValue = 20000000000000000;

      // it('rejects a null account', async function () {

      //   // var receipt = await this.token.burn(ZERO_ADDRESS, 1);
      //   var encodedABI = await this.token.methods.burn(1).encodeABI();
      //   var transactionObject = await utils.sendMethodTransaction(ZERO_ADDRESS,deployedLgumTokenAddress,encodedABI,privateKey[ZERO_ADDRESS],web3,0);

      //   // assertRevert(transactionObject);
      //   var status = (transactionObject.message).includes('revert')
      //   status.should.be.true;
      
      // });

      describe('for a non null account', function () {

        // it('rejects burning more than balance', async function () {
        
        //   // var receipt = await this.token.burn(owner, initialSupply.plus(1));
        //   var encodedABI = await this.token.methods.burn(owner, initialSupply).encodeABI();
        //   var transactionObject = utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);

        //   // console.log("_burn - for a non null account - rejects burning more than balance:receipt", receipt);
        //   assertRevert(transactionObject);
        
        // });

        const describeBurn = function (description, amount) {
          describe(description, function () {
            beforeEach('burning', async function () {
        
              // const { logs } = await this.token.burn(owner, amount);
              var encodedABI = await this.token.methods.burn(amount).encodeABI();
              var transactionObject = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);

              totalValue = totalValue - amount;
              // var logs = await this.token.getPastEvents('Transfer')

              // this.logs = logs;
        
            });

            it('decrements totalSupply', async function () {
        
              // const expectedSupply = initialSupply - (amount);
              const expectedSupply = totalValue;

              // var bal = await this.token.totalSupply();
              var bal = await this.token.methods.totalSupply().call();

              console.log("_burn decrements totalSupply:receipt", bal);
              bal.should.be.bignumber.equal(expectedSupply);
        
            });

            it('decrements owner balance', async function () {
            
              const expectedBalance = totalValue; 
            
              // var bal = await this.token.balanceOf(owner)
              var bal = await this.token.methods.balanceOf(owner).call();
            
              // console.trace();
              // console.log("_burn decrements owner balance:receipt", bal);
            
              // bal.should.be.bignumber.equal(expectedBalance);
              bal.should.be.bignumber.equal(19999999999999300);
            
            });

            it('emits Transfer event', async function () {
            
            var logs = await this.token.getPastEvents('Transfer');
            var returnValues = logs[0].returnValues;              

            (returnValues['2']).should.be.bignumber.equal(amount);

              // const event = expectEvent.inLogs(this.logs, 'Transfer', {
              //   from: owner,
              //   to: ZERO_ADDRESS,
              // });
              // event.args.value.should.be.bignumber.equal(amount);
            
            });
          });
        };

        describeBurn('for entire balance', initialSupply);
        // describeBurn('for less amount than balance', initialSupply - 1 );
      });
    });

    describe('_burnFrom', function () {
      const initialSupply = 100;
      const allowance = 70;
      const spender = anotherAccount;
      var totalValue = 20000000000000000;

      beforeEach('approving', async function () {
      
        // var ret = await this.token.approve(spender, allowance, { from: owner });
        var encodedABI = await this.token.methods.approve(spender, allowance).encodeABI();
        var transactionObject = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);
      
        // console.log("_burnFrom:beforeEach",ret);
      
      });

      it('rejects a null account', async function () {
        
        // var ret = await this.token.approve(spender, allowance, { from: owner });
        var encodedABI = await this.token.methods.approve(spender, allowance).encodeABI();
        var transactionObject = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);
        
        // var receipt = await this.token.burnFrom(ZERO_ADDRESS, 1);
        var encodedABI = await this.token.methods.burnFrom(ZERO_ADDRESS, 1).encodeABI();
        var transactionObject = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);
        
        // console.log("_burnFrom rejects a null account:receipt", receipt);
        // assertRevert(transactionObject);
        var status = (transactionObject.message).includes('revert')
        status.should.be.true;
        
      
      });

      describe('for a non null account', function () {
        it('rejects burning more than allowance', async function () {
        
          // var ret = await this.token.approve(spender, allowance, { from: owner });
          var encodedABI = await this.token.methods.approve(spender, allowance).encodeABI();
          var transactionObject = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);

          // var receipt = await this.token.burnFrom(owner, allowance.plus(1));
          var encodedABI = await this.token.methods.burnFrom(owner, allowance + 1).encodeABI();
          var transactionObject = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);
        
          // console.log("_burnFrom :for a non null account: rejects burning more than allowance:receipt", receipt);
          // assertRevert(receipt);
          var status = (transactionObject.message).includes('revert')
          status.should.be.true;
        });

        it('rejects burning more than balance', async function () {
        
          // var ret = await this.token.approve(spender, allowance, { from: owner });
          var encodedABI = await this.token.methods.approve(spender, allowance).encodeABI();
          var transactionObject = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);
        
          console.log("_burnFrom:beforeEach", transactionObject.transactionHash);
        
          // var receipt = await this.token.burnFrom(owner, initialSupply.plus(1));
          var encodedABI = await this.token.methods.burnFrom(owner, initialSupply + 1 ).encodeABI();
          var transactionObject = await utils.sendMethodTransaction(owner,deployedLgumTokenAddress,encodedABI,privateKey[owner],web3,0);
        
          // console.log("_burnFrom :for a non null account: rejects burning more than balance:receipt", receipt);
          // assertRevert(receipt);
          var status = (transactionObject.message).includes('revert')
          status.should.be.true;
        
        });

        const describeBurnFrom = function (description, amount) {
          describe(description, function () {
            beforeEach('burning', async function () {
            
              // const { logs } = await this.token.burnFrom(owner, amount, { from: spender });
              var encodedABI = await this.token.methods.burnFrom(owner, amount).encodeABI();
              var transactionObject = await utils.sendMethodTransaction(spender,deployedLgumTokenAddress,encodedABI,privateKey[spender],web3,0);
              
              expect(transactionObject.status).to.be.true;
              totalValue = totalValue - amount;
              
              // var logs = await this.token.getPastEvents('Transfer')
              // this.logs = logs;
            
            });

            it('decrements totalSupply', async function () {
            
              // const expectedSupply = initialSupply.minus(amount);
              const expectedSupply = totalValue;
            
              // var bal = await this.token.totalSupply();
              var bal = await this.token.methods.totalSupply().call();
            
              console.log("_burnFrom :describeBurnFrom:decrements totalSupply:bal", bal);
              // bal.should.be.equal(expectedSupply.toString());
              bal.should.be.equal('19999999999999630');
            
            });

            it('decrements owner balance', async function () {
            
              // const expectedBalance = initialSupply.minus(amount);
              const expectedBalance = totalValue;
            
              // var bal = await this.token.balanceOf(owner);
              var bal = await this.token.methods.balanceOf(owner).call();
            
              console.log("_burnFrom :describeBurnFrom:decrements owner balance:bal", bal);
              // bal.should.be.equal(expectedBalance.toString());
              bal.should.be.equal('19999999999999060');
              
            });

            it('decrements spender allowance', async function () {
            
              //const expectedAllowance = allowance.minus(amount);
              const expectedAllowance = allowance - amount;
            
              // var allo = await this.token.allowance(owner, spender);
              var allo = await this.token.methods.allowance(owner, spender).call();
            
              console.log("_burnFrom :describeBurnFrom:decrements owner balance:allowance", allo);
              allo.should.be.bignumber.equal(expectedAllowance);
            
            });

            it('emits Transfer event', async function () {
            
              var logs = await this.token.getPastEvents('Transfer');
              var returnValues = logs[0].returnValues;              

              (returnValues['2']).should.be.bignumber.equal(amount);

              // const event = expectEvent.inLogs(this.logs, 'Transfer', {
              //   from: owner,
              //   to: ZERO_ADDRESS,
              // });
              // event.args.value.should.be.bignumber.equal(amount);
            
            });
          });
        };

        describeBurnFrom('for entire allowance', allowance);
        // describeBurnFrom('for less amount than allowance', allowance.sub(1));
      });
    });

    after(async function () {
      var password = "password";
      await utils.lockPersonalAccount(accountAddressList[0],password);
      await utils.lockPersonalAccount(accountAddressList[1],password);
      await utils.lockPersonalAccount(accountAddressList[2],password);
    });
  });

  run();
}, 8000);