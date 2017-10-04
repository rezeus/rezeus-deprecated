const expect = require('chai').expect;

function sleep(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const runnerFactory = require('../../../src/Kernel/runner');

describe('runner', () => {
  describe('basics', () => {
    function fmw1nonext(ctx) {
      ctx.no.push(1);
    }

    function fmw1(ctx, next) {
      ctx.no.push(1);

      next();
    }

    function fmw2(ctx, next) {
      ctx.no.push(2);

      next();
    }

    function fmw3return(ctx) {
      ctx.no.push(3);

      return 3;
    }

    function fmw4returnnext(ctx, next) {
      ctx.no.push(4);

      return next();
    }


    it('should run with one middleware', async () => {
      const runner = runnerFactory([fmw1nonext]);
      const ctx = { no: [] };

      const expected = [1];

      await runner(ctx);

      expect(ctx.no).to.eql(expected);
    });

    it('should run with two middlewares', async () => {
      const runner = runnerFactory([fmw1, fmw2]);
      const ctx = { no: [] };

      const expected = [1, 2];

      await runner(ctx);

      expect(ctx.no).to.eql(expected);
    });

    it('should run with two middlewares with first no call next', async () => {
      const runner = runnerFactory([fmw1nonext, fmw2]);
      const ctx = { no: [] };

      const expected = [1];

      await runner(ctx);

      expect(ctx.no).to.eql(expected);
    });

    it('should return (undefined)', async () => {
      const runner = runnerFactory([fmw1]);
      const ctx = { no: [] };

      const expected = undefined;

      const returnValue = await runner(ctx);

      expect(returnValue).to.equal(expected);
    });

    it('should return last return (2)', async () => {
      const runner = runnerFactory([fmw3return]);
      const ctx = { no: [] };

      const expected = 3;

      const returnValue = await runner(ctx);

      expect(returnValue).to.equal(expected);
    });

    it('should return last return (3)', async () => {
      const runner = runnerFactory([fmw1, fmw3return]);
      const ctx = { no: [] };

      const expected = 3;

      const returnValue = await runner(ctx);

      expect(returnValue).to.equal(expected);
    });

    it('should wait...', async () => {
      const femw13async = async (ctx, next) => {
        /* setTimeout(() => {
          ctx.no.push(13);

          next();
        }, 1600); */

        await sleep(1600);

        ctx.no.push(13);

        next();
      };

      const runner = runnerFactory([fmw1, femw13async, fmw2]);
      const ctx = { no: [] };

      const expected = [1, 13, 2];

      await runner(ctx);

      expect(ctx.no).to.eql(expected);
    });

    // should run one runner inside another
  });
});
