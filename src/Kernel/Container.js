const path = require('path');

const debug = require('debug')('container');
const uuidv1 = require('uuid/v1');
const uuidv5 = require('uuid/v5');

const INTL = Symbol('internal');

/**
 * Requires a file just like node.js native require.
 *
 * @param {String} namespace
 * @return {Mixed}
 *
 * @throws Error when unable to load the module
 */
function requireEx(namespace) {
  /* eslint-disable global-require, import/no-dynamic-require */

  if (namespace.startsWith('./')/*  || namespace.startsWith('/') */) {
    const orig = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;

    const err = new Error();
    Error.captureStackTrace(err); // Use stack index 2
    // Error.captureStackTrace(err, arguments.callee); // Use stack index 1

    const stack = err.stack;
    Error.prepareStackTrace = orig;

    const callerFilePath = stack[2].getFileName();

    /**
     * Since _require method is first called by this module, we
     * need to fetch the 2nd caller.
     */
    const callerDirectory = path.dirname(callerFilePath);
    return require(path.join(callerDirectory, namespace));
  }

  debug('falling back to native require for %s namespace', namespace);
  return require(namespace);

  /* eslint-enable global-require, import/no-dynamic-require */
}

class Internal {
  constructor(id) {
    this.id = id;

    /**
     * Store list of bindings with their closures
     *
     * @attribute bindings
     * @type {Map}
     */
    this.bindings = new Map();

    /**
     * Stores the list of aliases and namespaces
     * as key/value pair
     *
     * @attribute aliases
     * @type {Object}
     */
    this.aliases = {};

    /**
     * Stores list of auto-loaded directories and
     * their namespaces as key/value pair
     *
     * @attribute autoLoads
     * @type {Object}
     */
    this.autoLoads = {};

    /**
     * Stores list of managers for the bindings to
     * be extended.
     *
     * @attribute managers
     * @type {Object}
     */
    /* this.managers = {}; */

    /**
     * Stores list of runtime fakes
     *
     * @attribute fakes
     * @type {Map}
     */
    /* this.fakes = new Map(); */

    /**
     * Reference to all extend calls. Extend calls
     * are executed right after all providers
     * have been booted
     *
     * @type {Object}
     */
    /* this.extendCalls = []; */
  }

  // Private functions here
  //

  /**
   * Returns whether a namespace has been registered
   * as a binding inside the container or not.
   *
   * @method isBinding
   * @private
   *
   * @param {String} namespace
   * @return {Boolean}
   */
  isBinding(namespace) {
    return this.bindings.has(namespace);
  }

  /**
   * Resolves binding from the bindings map and returns the
   * evaluated value after calling the binding closure.
   *
   * It is important to call isBinding before calling this
   * method to avoid exceptions being thrown.
   *
   * @method resolveBinding
   * @private
   *
   * @param {String} namespace
   * @return {Mixed}
   */
  resolveBinding(namespace) {
    const binding = this.bindings.get(namespace);
    debug('resolving %s namespace as a binding', namespace);

    let resolved = null;

    if (binding.singleton) {
      if (binding.cachedValue === null) {
        binding.cachedValue = binding.closure(this);
      }

      resolved = binding.cachedValue;
    } else {
      resolved = binding.closure(this);
    }

    if (!Object.prototype.hasOwnProperty.call(resolved, 'id')) {
      Object.defineProperty(resolved, 'id', {
        value: uuidv5(namespace, this.id),
      });
    }

    return resolved;
  }

  /**
   * Returns whether the given namespace is registered as an alias
   * or not. It is does check whether the aliased namespace has
   * been registered to the container or not.
   *
   * @method isAlias
   * @private
   *
   * @param  {String} namespace
   * @return {Boolean}
   */
  isAlias(namespace) {
    return this.aliases[namespace];
  }

  /**
   * Returns the namespace of an auto-loaded directory when
   * subset of the namespace to be resolved matches. This function
   * matches the start of the string.
   *
   * ```
   * // Registered namespace: App
   * // Namespace to be resolved: App/Controllers/UsersController
   * 'App/Controllers/UsersController'.startsWith('App')
   * ```
   *
   * @method getAutoLoadedNamespace
   * @private
   *
   * @param  {String} namespace
   * @return {String}
   */
  getAutoLoadedNamespace(namespace) {
    return Object.keys(this.autoLoads).find(registeredNamespace => namespace.startsWith(`${registeredNamespace}/`));
  }

  /**
   * Returns a boolean indicating whether the namespace to
   * be resolved belongs to a auto-loaded directory.
   *
   * @method isAutoLoadedPath
   * @private
   *
   * @param  {String} namespace
   * @return {Boolean}
   */
  isAutoLoadedPath(namespace) {
    return !!this.getAutoLoadedNamespace(namespace);
  }

  /**
   * Requires a file by resolving the auto-loaded namespace. It
   * is important to call isAutoLoadedPath before calling
   * this method, to avoid exceptions been thrown.
   *
   * @method resolveAutoLoadedPath
   * @private
   *
   * @param  {String} namespace
   * @return {Mixed}
   */
  resolveAutoLoadedPath(namespace) {
    const autoLoadedNamespace = this.getAutoLoadedNamespace(namespace);
    debug('resolving %s namespace from %s path', namespace, this.autoLoads[autoLoadedNamespace]);

    const result = requireEx(
      namespace.replace(autoLoadedNamespace, this.autoLoads[autoLoadedNamespace]));
    if (!result) {
      return result;
    }

    // NOTE 'IocHooks' or 'iocHooks' replaced with 'containerHooks'
    if (!Array.isArray(result.containerHooks)) {
      return result;
    }

    result.containerHooks.forEach((hook) => {
      if (typeof result[hook] === 'function') {
        result[hook]();
      }
    });

    return result;
  }
}

class Container {
  constructor() {
    this.id = uuidv1();
    this[INTL] = new Internal(this.id);
    this.providers = [];
  }

  get bindings() {
    return new Map(this[INTL].bindings);
  }

  /**
   * Binds a namespace against the container as a binding. Given
   * closure is a factory method, called every time the binding
   * is resolved and return value of closure will be returned
   * back.
   *
   * @method bind
   *
   * @param {String} namespace
   * @param {Function} closure
   * @throws {TypeError} If closure is not a function
   *
   * @example
   * ```
   * container.bind('App/Foo', (app) => {
   *   const Config = app.resolve('Adonis/Src/Config')
   *
   *   class Foo {
   *     constructor (Config) {
   *     }
   *   }
   *
   *   return new Foo(Config)
   * })
   * ```
   */
  bind(namespace, closure) {
    if (typeof closure !== 'function') {
      throw new TypeError('Container#bind expects 2nd parameter to be a function', closure);
    }
    // FIXME Also check if the `closure` is class, if so throw error

    debug('binding %s namespace to container', namespace);

    this[INTL].bindings.set(namespace, {
      closure,
      singleton: false,
      cachedValue: null,
    });
  }

  /**
   * Similar to bind except it will bind the namespace as
   * a singleton and will call the closure only once.
   *
   * @method singleton
   *
   * @param {String} namespace
   * @param {Function} closure
   * @throws {TypeError} If closure is not a function
   *
   * @example
   * ```
   * Container.singleton('App/Foo', (app) => {
   *   const Config = app.resolve('Adonis/Src/Config')
   *
   *   class Foo {
   *     constructor (Config) {
   *     }
   *   }
   *
   *   return new Foo(Config)
   * })
   * ```
   */
  singleton(namespace, closure) {
    if (typeof closure !== 'function') {
      throw TypeError('Container#singleton expects 2nd parameter to be a closure', closure);
    }

    debug('binding %s namespace as singleton to container', namespace);

    this[INTL].bindings.set(namespace, {
      closure,
      singleton: true,
      cachedValue: null,
    });
  }

  /**
   * Attempts to resolve a namespace in following order.
   *
   * 1. Look for a registered binding.
   * 2. Look for an alias, if found: Repeat step 1 with alias namespace.
   * 3. Look for an auto-load module path.
   * 4. Fallback to native require method.
   *
   * @method resolve
   *
   * @param {String} namespace
   * @return {Mixed} resolved value
   *
   * @example
   * ```
   *  Container.resolve('View') // via alias
   *  Container.resolve('Adonis/Src/View') // via complete namespace
   *  Container.resolve('App/Http/Controllers/UsersController') // auto-loaded namespace
   * ```
   */
  resolve(namespace) {
    let resolved = null;

    if (this[INTL].isBinding(namespace)) {
      resolved = this[INTL].resolveBinding(namespace);
    } else if (this[INTL].isAlias(namespace)) {
      resolved = this.resolve(this[INTL].aliases[namespace]);
    } else if (this[INTL].isAutoLoadedPath(namespace)) {
      resolved = this[INTL].resolveAutoLoadedPath(namespace);
    } else {
      resolved = requireEx(namespace);
    }

    return resolved;
  }

  // TODO doc
  makeInstanceOf(Item) {
    if (
      (typeof Item === 'function' && /^class\s/.test(Function.prototype.toString.call(Item))) || // is class?
      Item.makePlain // @see https://github.com/adonisjs/adonis-lucid/blob/c3b5da3e6bb1782ec01619ceffa804cb7b2cb190/src/Lucid/Model/index.js#L75
    ) {
      return Item;
    }

    // Determine and instantiate the injections
    const injections = (Item.inject || []).map(dependency => this.container.make(dependency));

    return new Item(...injections);
  }

  // TODO doc
  make(namespace) {
    if (typeof namespace !== 'string') {
      return this.makeInstanceOf(namespace);
    }

    if (this[INTL].isBinding(namespace)) {
      return this[INTL].resolveBinding(namespace);
    }

    if (this[INTL].isAlias(namespace)) {
      return this.make(this[INTL].aliases[namespace]);
    }

    if (this[INTL].isAutoLoadedPath(namespace)) {
      return this.makeInstanceOf(
        this[INTL].resolveAutoLoadedPath(namespace));
    }

    return requireEx(namespace);
  }

  register(providers, pathPrefix) {
    if (typeof providers !== 'object' && !Array.isArray(providers)) {
      throw new Error('The argument must be array of providers.');
    }

    providers.forEach(async (provider) => {
      const providerPath = path.join(pathPrefix, provider);

      /* eslint-disable global-require, import/no-dynamic-require */
      const Clazz = require(providerPath);
      /* eslint-enable global-require, import/no-dynamic-require */
      const inst = (typeof Clazz === 'function') // TODO Check if Clazz is really a class
        ? new Clazz()
        : Clazz;

      // for boot
      this.providers.push({
        name: provider,
        path: providerPath,
        inst,
      });

      await inst.register.apply(this, []);
    });
  }

  boot() {
    this.providers.forEach((provider) => {
      if (typeof provider.inst.boot === 'function') {
        provider.inst.boot.apply(provider.inst, [this]);
      }
    });

    // the app was booted
  }
}

module.exports = Container;
