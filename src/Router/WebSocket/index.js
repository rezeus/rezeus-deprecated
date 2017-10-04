// TODO http ile ilgili olanları sil

/* global resolve */

const EventEmitter = require('events');

const runnerFactory = require('../../Kernel/runner');

const INTL = Symbol('internal');

class Internal {
  constructor() {
    this.routes = new Map();
    this.middlewares = [];
  }

  addRoute(method, path, handler) {
    this.routes.set(`${method} ${path}`, handler);
  }
}

class Router extends EventEmitter {
  constructor() {
    super();

    this[INTL] = new Internal();
  }

  match(methodOrRequest, argPath) {
    const paramType = typeof methodOrRequest;

    let method = '';
    let path = '';

    if (paramType === 'string') {
      method = methodOrRequest;
      path = argPath;
    } else if (paramType === 'object') {
      /* if (methodOrRequest instanceof Request) { */
      method = methodOrRequest.method;
      path = methodOrRequest.path || methodOrRequest.url;
      /* } */
    }

    return this[INTL].routes.get(`${method.toString().toUpperCase()} ${path}`);
  }

  use(middleware) {
    this[INTL].middlewares.push(middleware);
  }

  on(path, ...middlewares) {
    const routeAddingResult = this.emit('route adding', [path/* , handler */]);
    if (routeAddingResult.stopped) {
      return;
    }

    // FIXME middlewares'in içinde string de olabilir ('controller.action')
    const processedMiddlewares = middlewares.map((item) => {
      switch (typeof item) {
        case 'string': {
          const parsed = item.split('.');
          const controllerName = parsed[0];
          const actionName = parsed[1];

          const controller = resolve(`${global.APP_ROOT}/app/Http/Controllers/${controllerName}Controller`);

          if (Object.prototype.hasOwnProperty.call(controller, actionName)) {
            return (ctx, next) => {
              controller[actionName].apply(controller, [ctx, next]);
            };
          }

          throw new Error(`Action (${actionName}) couldn't be found in controller (${controllerName}).`);
        }

        case 'function':
        default:
          return item;
      }
    });

    const route = {
      stack: [
        ...this[INTL].middlewares,
        ...processedMiddlewares,
      ],
      handle(ctx) {
        const runner = runnerFactory(this.stack);

        return runner(ctx);
      },
    };
    this[INTL].addRoute('GET', path, route);

    this.emit('route added', [path/* , handler */]);
  }

  //
}

module.exports = Router;
