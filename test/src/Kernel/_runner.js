const expect = require('chai').expect;

const harmonia = require('../../../src/Kernel/runner');

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms || 1));
}

describe('runner', () => {
  describe('calling with wrong parameters', () => {
    it('should throw error if not a function nor an array given', () => {
      expect(harmonia.bind(harmonia)).to.throw(
        Error, 'Array must contain only functions.');

      expect(harmonia.bind(harmonia, null)).to.throw(
        Error, 'Array must contain only functions.');

      expect(harmonia.bind(harmonia, undefined)).to.throw(
        Error, 'Array must contain only functions.');
    });

    it('should return immediately when given array is empty', async () => {
      const semele = harmonia([]);
      const ctx = { counter: 0 };

      await semele();

      expect(ctx.counter).to.equal(0);
    });

    it('should throw error if given array has at least one item not a function', () => {
      expect(harmonia.bind(harmonia, [() => {}, 'foo'])).to.throw(
        Error, 'Array must contain only functions');
    });

    it('should run one middleware', async () => {
      const mw1 = (ctx, next) => {
        ctx.counter += 1;

        next();
      };

      const semele = harmonia([mw1]);
      const ctx = { counter: 0 };

      await semele(ctx);

      expect(ctx.counter).to.equal(1);
    });
  });

  describe('calling next multiple times', () => {
    it('should throw error (then)', function fn() {
      const middlewares = [];

      const doubleNext = async (ctx, next) => {
        await next();
        await next();
      };

      middlewares.push(doubleNext);

      const semele = harmonia(middlewares);
      const ctx = null;

      semele(ctx)
        .then(() => {
          throw new Error('boom');
        }, (error) => {
          expect(error).to.eql(new Error('next() called multiple times.'));
        });
    });

    it('should throw error (await in async)', async function fn() {
      const middlewares = [];

      const doubleNext = async (ctx, next) => {
        await next();
        await next();
      };

      middlewares.push(doubleNext);

      const semele = harmonia(middlewares);
      const ctx = null;

      try {
        await semele(ctx);
      } catch (error) {
        expect(error).to.eql(new Error('next() called multiple times.'));
      }
    });

    it('should throw error (then in lambda)', () => {
      const middlewares = [];

      const doubleNext = async (ctx, next) => {
        await next();
        await next();
      };

      middlewares.push(doubleNext);

      const semele = harmonia(middlewares);
      const ctx = null;

      semele(ctx)
        .then(() => {
          throw new Error('boom');
        }, (error) => {
          expect(error).to.eql(new Error('next() called multiple times.'));
        });
    });

    it('should throw error (await in async lambda)', async () => {
      const middlewares = [];

      const doubleNext = async (ctx, next) => {
        await next();
        await next();
      };

      middlewares.push(doubleNext);

      const semele = harmonia(middlewares);
      const ctx = null;

      try {
        await semele(ctx);
      } catch (error) {
        expect(error).to.eql(new Error('next() called multiple times.'));
      }
    });


    it('should throw error on first (await in async lambda)', async () => {
      const middlewares = [];

      const doubleNext = async (ctx, next) => {
        await next();
        await next();
      };

      const second = async (ctx, next) => {
        await next();
      };

      middlewares.push(doubleNext);
      middlewares.push(second);

      const semele = harmonia(middlewares);
      const ctx = null;

      try {
        await semele(ctx);
      } catch (error) {
        expect(error).to.eql(new Error('next() called multiple times.'));
      }
    });

    it('should throw error on second (await in async lambda)', async () => {
      const middlewares = [];

      const first = async (ctx, next) => {
        await next();
      };

      const doubleNext = async (ctx, next) => {
        await next();
        await next();
      };

      middlewares.push(first);
      middlewares.push(doubleNext);

      const semele = harmonia(middlewares);
      const ctx = null;

      try {
        await semele(ctx);
      } catch (error) {
        expect(error).to.eql(new Error('next() called multiple times.'));
      }
    });

    it('should throw error on second of three (await in async lambda)', async () => {
      const middlewares = [];

      const first = async (ctx, next) => {
        await next();
      };

      const doubleNext = async (ctx, next) => {
        await next();
        await next();
      };

      const third = async (ctx, next) => {
        await next();
      };

      middlewares.push(first);
      middlewares.push(doubleNext);
      middlewares.push(third);

      const semele = harmonia(middlewares);
      const ctx = null;

      try {
        await semele(ctx);
      } catch (error) {
        expect(error).to.eql(new Error('next() called multiple times.'));
      }
    });


    it('should throw error considering ctx (await in async lambda)', async () => {
      const middlewares = [];

      const doubleNext = async (ctx, next) => {
        ctx.counter += 1;
        await next();
        ctx.counter += 1;
        await next();
        ctx.counter += 1;
      };

      middlewares.push(doubleNext);

      const semele = harmonia(middlewares);
      const ctx = { counter: 0 };
      const expected = { counter: 2 };

      try {
        await semele(ctx);
      } catch (error) {
        expect(ctx).to.eql(expected);
        expect(error).to.eql(new Error('next() called multiple times.'));
      }
    });

    it('should throw error on first considering ctx (await in async lambda)', async () => {
      const middlewares = [];

      const doubleNext = async (ctx, next) => {
        ctx.counter += 1;
        await next();
        ctx.counter += 1;
        await next();
        ctx.counter += 1;
      };

      const second = async (ctx, next) => {
        ctx.counter += 1;
        await next();
        ctx.counter += 1;
      };

      middlewares.push(doubleNext);
      middlewares.push(second);

      const semele = harmonia(middlewares);
      const ctx = { counter: 0 };
      const expected = { counter: 4 };

      try {
        await semele(ctx);
      } catch (error) {
        expect(ctx).to.eql(expected);
        expect(error).to.eql(new Error('next() called multiple times.'));
      }
    });

    it('should throw error on second of three considering ctx (await in async lambda)', async () => {
      const middlewares = [];

      const first = async (ctx, next) => {
        ctx.counter += 1;
        await next();
        ctx.counter += 1;
      };

      const doubleNext = async (ctx, next) => {
        ctx.counter += 1;
        await next();
        ctx.counter += 1;
        await next();
        ctx.counter += 1;
      };

      const third = async (ctx, next) => {
        ctx.counter += 1;
        await next();
        ctx.counter += 1;
      };

      middlewares.push(first);
      middlewares.push(doubleNext);
      middlewares.push(third);

      const semele = harmonia(middlewares);
      const ctx = { counter: 0 };
      const expected = { counter: 5 };

      try {
        await semele(ctx);
      } catch (error) {
        expect(ctx).to.eql(expected);
        expect(error).to.eql(new Error('next() called multiple times.'));
      }
    });
  });

  describe('error handling', () => {
    it('first and one middleware should throw error', async () => {
      const middlewares = [
        () => {
          throw new Error('Alone middleware throws the error.');
        },
      ];
      const semele = harmonia(middlewares);
      const ctx = { counter: 0 };

      try {
        await semele(ctx);
      } catch (error) {
        expect(error).to.eql(new Error('Alone middleware throws the error.'));
      }
    });

    it('first of two middlewares should throw error', async () => {
      const middlewares = [
        () => {
          throw new Error('First middleware throws the error.');
        },
        (ctx) => {
          ctx.counter += 1;
        },
      ];
      const semele = harmonia(middlewares);
      const ctx = { counter: 0 };

      try {
        await semele(ctx);
      } catch (error) {
        expect(error).to.eql(new Error('First middleware throws the error.'));
      }
    });

    it('second of two middlewares should throw error', async () => {
      const middlewares = [
        (ctx) => {
          ctx.counter += 1;
        },
        () => {
          throw new Error('First middleware throws the error.');
        },
      ];
      const semele = harmonia(middlewares);
      const ctx = { counter: 0 };

      try {
        await semele(ctx);
      } catch (error) {
        expect(ctx.counter).to.equal(1);
        expect(error).to.eql(new Error('First middleware throws the error.'));
      }
    });
  });

  describe('more than one harmonia', () => {
    it('should run both harmonia\'s middlewares (then)', () => {
      const middlewares1 = [
        async (ctx, next) => { await next(); ctx.counter += 1; ctx.order.push(1); },
        (ctx, next) => { ctx.counter += 2; ctx.order.push(2); next(); },
      ];

      const middlewares2 = [
        (ctx, next) => { ctx.counter += 4; ctx.order.push(4); next(); },
        (ctx, next) => { ctx.counter += 8; ctx.order.push(8); next(); },
        (ctx, next) => { ctx.counter += 16; ctx.order.push(16); next(); },
      ];

      const ino = harmonia(middlewares1);
      const semele = harmonia([...middlewares2, ino]);
      const ctx = { counter: 0, order: [] };
      const expected = { counter: 31, order: [4, 8, 16, 2, 1] };

      semele(ctx)
        .then(() => {
          expect(ctx).to.eql(expected);
        })
        .catch((error) => {
          expect(error).to.equal(undefined);
        });
    });

    it('should run both harmonia\'s middlewares (async)', async () => {
      const middlewares1 = [
        async (ctx, next) => { await next(); ctx.counter += 1; ctx.order.push(1); },
        (ctx, next) => { ctx.counter += 2; ctx.order.push(2); next(); },
      ];

      const middlewares2 = [
        (ctx, next) => { ctx.counter += 4; ctx.order.push(4); next(); },
        (ctx, next) => { ctx.counter += 8; ctx.order.push(8); next(); },
        (ctx, next) => { ctx.counter += 16; ctx.order.push(16); next(); },
      ];

      const ino = harmonia(middlewares1);
      const semele = harmonia([...middlewares2, ino]);
      const ctx = { counter: 0, order: [] };
      const expected = { counter: 31, order: [4, 8, 16, 2, 1] };

      try {
        await semele(ctx);

        expect(ctx).to.eql(expected);
      } catch (error) {
        expect(error).to.equal(undefined);
      }
    });

    it('should work with other compositions', function fn() {
      const called = [];

      return harmonia([
        harmonia([
          (ctx, next) => {
            called.push(1);
            return next();
          },
          (ctx, next) => {
            called.push(2);
            return next();
          },
        ]),
        (ctx, next) => {
          called.push(3);
          return next();
        },
      ])({})
        .then(() => expect(called).to.eql([1, 2, 3]));
    });
  });


  describe('koajs\'s tests', () => {
    it('should work', function fn() {
      const arr = [];
      const stack = [];

      stack.push(async (context, next) => {
        arr.push(1);
        await wait(1);
        await next();
        await wait(1);
        arr.push(6);
      });

      stack.push(async (context, next) => {
        arr.push(2);
        await wait(1);
        await next();
        await wait(1);
        arr.push(5);
      });

      stack.push(async (context, next) => {
        arr.push(3);
        await wait(1);
        await next();
        await wait(1);
        arr.push(4);
      });

      const semele = harmonia(stack);
      const ctx = null;
      const expected = [1, 2, 3, 4, 5, 6];

      semele(ctx)
        .then(function sfn() {
          expect(arr).to.eql(expected);
        });
    });

    it('should be able to be called twice', () => {
      const stack = [];

      stack.push(async (context, next) => {
        context.arr.push(1);
        await wait(1);
        await next();
        await wait(1);
        context.arr.push(6);
      });

      stack.push(async (context, next) => {
        context.arr.push(2);
        await wait(1);
        await next();
        await wait(1);
        context.arr.push(5);
      });

      stack.push(async (context, next) => {
        context.arr.push(3);
        await wait(1);
        await next();
        await wait(1);
        context.arr.push(4);
      });

      const semele = harmonia(stack);
      const ctx1 = { arr: [] };
      const ctx2 = { arr: [] };
      const expected = { arr: [1, 2, 3, 4, 5, 6] };

      semele(ctx1)
        .then(() => {
          expect(ctx1).to.eql(expected);

          return semele(ctx2);
        })
        .then(() => {
          expect(ctx2).to.eql(expected);
        });
    });

    it('should be able to be called twice (async)', async () => {
      const stack = [];

      stack.push(async (context, next) => {
        context.arr.push(1);
        await wait(1);
        await next();
        await wait(1);
        context.arr.push(6);
      });

      stack.push(async (context, next) => {
        context.arr.push(2);
        await wait(1);
        await next();
        await wait(1);
        context.arr.push(5);
      });

      stack.push(async (context, next) => {
        context.arr.push(3);
        await wait(1);
        await next();
        await wait(1);
        context.arr.push(4);
      });

      const semele = harmonia(stack);
      const ctx1 = { arr: [] };
      const ctx2 = { arr: [] };
      const expected = { arr: [1, 2, 3, 4, 5, 6] };

      await semele(ctx1);
      expect(ctx1).to.eql(expected);

      await semele(ctx2);
      expect(ctx2).to.eql(expected);
    });

    it('should reject on errors in middleware', () => {
      const stack = [];

      stack.push(() => { throw new Error('The error.'); });

      const semele = harmonia(stack);
      const ctx = null;

      semele(ctx)
        .then(() => {
          throw new Error('promise was not rejected');
        })
        .catch((error) => {
          expect(error).to.eql(new Error('The error.'));
        });
    });

    it('should keep the context', (done) => {
      const stack = [];

      const ctx = {};

      stack.push(async (ctx2, next) => {
        await next();

        expect(ctx2).to.eql(ctx);
      });

      stack.push(async (ctx2, next) => {
        await next();

        expect(ctx2).to.eql(ctx);
      });

      stack.push(async (ctx2, next) => {
        await next();

        expect(ctx2).to.eql(ctx);
      });

      const semele = harmonia(stack);

      semele(ctx)
        .then(() => { done(); });
    });

    it('should catch downstream errors', function fn() {
      const arr = [];
      const stack = [];

      stack.push(async (ctx, next) => {
        arr.push(1);

        try {
          arr.push(6);
          await next();
          arr.push(7);
        } catch (err) {
          arr.push(2);
        }

        arr.push(3);
      });

      // eslint-disable-next-line no-unused-vars
      stack.push(async (ctx, next) => {
        arr.push(4);
        throw new Error();
        // arr.push(5)
      });

      const semele = harmonia(stack);
      const ctx = null;
      const expected = [1, 6, 4, 2, 3];

      semele(ctx)
        .then(() => {
          expect(arr).to.eql(expected);
        });
    });

    it('should call harmonia\'s next', function fn() {
      let called = false;

      const semele = harmonia([(ctx, next) => { next(); }]);
      const ctx = null;
      const next = async () => {
        called = true;
      };

      semele(ctx, next)
        .then(() => {
          expect(called).to.eql(true);
        });
    });

    it('should handle errors in wrapped non-async functions', function fn() {
      const stack = [];

      stack.push(function sfn() {
        throw new Error();
      });

      const semele = harmonia(stack);
      const ctx = null;

      semele(ctx)
        .then(() => {
          throw new Error('promise was not rejected');
        })
        .catch((error) => {
          expect(error).to.eql(new Error());
        });
    });

    it('should return a valid middleware', function fn() {
      let val = 0;

      harmonia([
        harmonia([
          (ctx, next) => {
            val += 1;

            next();
          },
          (ctx, next) => {
            val += 1;

            next();
          },
        ]),
        (ctx, next) => {
          val += 1;

          next();
        },
      ])({}).then(function sfn() {
        expect(val).to.equal(3);
      });
    });

    it('should return last return value', function fn() {
      const stack = [];

      stack.push(async (context, next) => {
        const val = await next();
        expect(val).to.be.equal(2);
        return 1;
      });

      stack.push(async (context, next) => {
        const val = await next();
        expect(val).to.be.equal(0);
        return 2;
      });

      const next = () => 0;
      const semele = harmonia(stack);
      const ctx = null;

      semele(ctx, next)
        .then((val) => {
          expect(val).to.be.equal(1);
        });
    });

    it('should not affect the original middleware array', () => {
      const stack = [];

      const fn1 = (ctx, next) => next();

      stack.push(fn1);

      for (const fn of stack) {
        expect(fn).to.eql(fn1);
      }

      harmonia(stack);

      for (const fn of stack) {
        expect(fn).to.eql(fn1);
      }
    });

    it('should not get stuck on the passed in next', () => {
      const middleware = [(ctx, next) => {
        ctx.middleware += 1;
        return next();
      }];

      const ctx = { middleware: 0, next: 0 };
      const expected = { middleware: 1, next: 1 };

      harmonia(middleware)(ctx, (ctxInner, next) => {
        ctxInner.next += 1;
        return next();
      }).then(() => {
        expect(ctx).to.eql(expected);
      });
    });
  });


  describe('examples', () => {
    it('two after-middlewares', async () => {
      const xResponseTime = async function fnRT(ctx, next) {
        const start = new Date();

        await next();

        ctx.responseTime = new Date() - start;
      };

      const logger = async function fnL(ctx, next) {
        const start = new Date();

        await next();

        const ms = new Date() - start;
        ctx.console = `${ctx.method} ${ctx.url} - ${ms}`;
      };

      const mw1 = (ctx) => {
        ctx.counter = 42;
      };

      const middlewares = [xResponseTime, logger, mw1];
      const semele = harmonia(middlewares);
      const ctx = {
        method: 'GET',
        url: '/',
        responseTime: -1,
        counter: 0,
        console: '',
      };

      try {
        await semele(ctx);
      } catch (error) {
        throw Error('Unwanted error.');
      }

      expect(ctx.counter).to.equal(42);
      expect(ctx.responseTime).to.not.equal(-1);
      expect(ctx.console).to.not.equal('');
    });
  });

  describe('complex examples', () => {
    it('should work', async function fn() {
      const stack = [];
      const arr = [];

      stack.push(async (ctx, next) => {
        arr.push(1);
        await wait(1);
        await next();
        await wait(2);
        arr.push(6);
      });

      stack.push(async (ctx, next) => {
        arr.push(2);
        await wait(1);
        await next();
        await wait(2);
        arr.push(5);
      });

      stack.push(async (ctx, next) => {
        arr.push(3);
        await wait(1);
        await next();
        await wait(2);
        arr.push(4);
      });

      const semele = harmonia(stack);
      const context = null;

      await semele(context);

      expect(arr).to.eql([1, 2, 3, 4, 5, 6]);
    });

    it('should error', async function fn() {
      const stack = [];
      const arr = [];

      stack.push(async (ctx, next) => {
        arr.push(1);
        await wait(1);
        await next();
        await wait(2);
        arr.push(6);
      });

      stack.push(async (ctx, next) => {
        arr.push(2);
        const cnd = true;
        if (cnd === true) {
          throw new Error('Very important error');
        }
        await wait(1);
        await next();
        await wait(2);
        arr.push(5);
      });

      stack.push(async (ctx, next) => {
        arr.push(3);
        await wait(1);
        await next();
        await wait(2);
        arr.push(4);
      });

      const semele = harmonia(stack);
      const context = null;

      try {
        await semele(context);
      } catch (error) {
        expect(error).to.eql(new Error('Very important error'));
      }
    });
  });

  /* describe('real world examples', () => {
    function createRequest() {
      const req = {
        _method: 'GET', // TODO Get method from raw
        overrideMethod: (method) => {
          console.log('overriding to... ' + method);
          this._method = method.toString().toUpperCase();
          console.log('new value: ' + this._method);
        },
      };
      // TODO Move these to class' constructor
      Object.defineProperty(req, 'raw', {
        configurable: false,
        writable: false,
        value: null, // TODO Node.js IncomingMessage
      });
      Object.defineProperty(req, 'method', {
        configurable: true,
        get: () => {
          console.log(req._method);

          return req._method;
        },
      });
      Object.defineProperty(req, 'body', {
        configurable: false,
        writable: false,
        value: '', // TODO Get body somehow, 'body-parser' see https://github.com/expressjs/body-parser
      });
      //

      const res = {};
      // TODO Move these to class' constructor
      Object.defineProperty(res, 'raw', {
        configurable: false,
        writable: false,
        value: null, // TODO Node.js ServerResponse
      });
      Object.defineProperty(res, 'status', {
        configurable: false,
        writable: true,
        value: 404,
      });
      Object.defineProperty(res, 'body', {
        configurable: false,
        writable: true,
        value: '', // TODO Get body somehow, 'body-parser' see https://github.com/expressjs/body-parser
      });
      //

      return {
        req,
        res,
      };
    }

    it('should create valid request and response base', () => {
      const { req, res } = createRequest();

      expect(res.status).to.equal(404);
      res.status = 200;
      expect(res.status).to.equal(200);
      delete res.status;
      expect(res.status).to.equal(200);

      expect(req.body).to.eql('');
      try {
        req.body = 'foo';
      } catch (err) {
        expect(err).to.eql(new TypeError('Cannot redefine property: body'));
        // expect(req.body).to.eql('');
      }

      expect(req.method).to.equal('GET');
      req.method = 'POST';
      expect(req.method).to.equal('GET');
      req.overrideMethod('PATCH');
      expect(req.method).to.equal('PATCH');

      // TODO
    });

    it('should route correct 1', async () => {
      const stack = [];

      const routes = new Map();

      const router = async (ctx, next) => {
        let path = ctx.path;

        // if (ctx.router.isStrict) {
        //
        // }

        const route = routes.get(path);

        if (typeof route === 'undefined') {
          // TODO 404
          console.log(`Not Found: ${path}`);
        } else {
          const result = await route.fn.apply(this, [ctx]);
          const resultType = typeof result;

          if (resultType !== 'undefined') {
            switch (resultType) {
              case 'string': {
                ctx.body = result;

                break;
              }

              default:
            }
          }

          next();
        }
      };

      routes.set('/', {
        fn: (ctx) => {
          ctx.status = 200;
        },
      });
      //

      const logger = (ctx, message) => {
        if (ctx.body === '') {
          ctx.body = `${ctx.path} ${ctx.method} | ${message}`;
        } else {
          // throw new Error('Trying to rewrite on body.');
        }
      };


      stack.push(async (ctx, next) => {
        await next();

        logger(ctx, 'log');
      });

      stack.push((ctx, next) => {
        router(ctx, next);
      });


      const semele = harmonia(stack);

      const context = {
        path: '/',
        method: 'GET',
        status: 404,
        body: '',
      };

      await semele(context);

      expect(context.body).to.eql('/ GET | log');
      expect(context.status).to.eql(200);
      //
      const context2 = {
        path: '/home',
        method: 'GET',
        status: 404,
        body: '',
      };

      routes.set('/home', {
        fn: (ctx) => {
          ctx.status = 200;

          // ctx.body = 'home';
          return 'home';
        },
      });

      await semele(context2);

      expect(context2.body).to.eql('home');
      expect(context2.status).to.eql(200);
    });
  }); */
});
