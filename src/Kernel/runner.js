/**
 * Compose given middleware function(s) and
 * in return give the caller a runner function.
 *
 * @param {Array} middlewares
 * @returns {Function|Error} The runner function, to be called with a context object
 */
function runnerFactory(middlewares) {
  if (typeof middlewares !== 'object' || !Array.isArray(middlewares)) {
    throw new Error('A function or an array of functions should be given.');
  }

  const middlewaresCount = middlewares.length;

  if (middlewaresCount === 0) {
    return () => Promise.resolve();
  }

  for (let i = 0; i < middlewaresCount; i += 1) {
    if (typeof middlewares[i] !== 'function') {
      throw new Error('Array must contain only functions.');
    }
  }

  return async function runner(context, next) {
    let lastIndex = -1;
    let tempReturn;
    let lastReturn;

    async function dispatch(index) {
      // Dispatch and execute `next` middleware in the stack.

      if (index <= lastIndex) {
        return Promise.reject(new Error('next() called multiple times'));
      }

      lastIndex = index;

      /**
       * @type {Function}
       */
      const thisMiddleware = (index === middlewaresCount)
        ? next
        : middlewares[index];

      if (!thisMiddleware) {
        // This is where a middleware called `next` but there is
        // no next middleware exists in the stack. So in order
        // to continue to execute the middleware that called
        // next, resolve the `next` and return immediately.
        return Promise.resolve();
      }

      try {
        /* eslint-disable prefer-arrow-callback */
        tempReturn = await thisMiddleware(context, async function thisMiddlewaresNext(...args) {
          await dispatch(index + 1);
        });

        if (index === middlewaresCount - 1) {
          // returning from the last function in the stack - without calling next
          lastReturn = tempReturn;
        }

        // resolving with anything is not effective
        return Promise.resolve();
      } catch (err) {
        return Promise.reject(err);
      }
    }

    try {
      await dispatch(0);

      return Promise.resolve(lastReturn);
    } catch (err) {
      return Promise.reject(err);
    }
  };
}

module.exports = runnerFactory;
