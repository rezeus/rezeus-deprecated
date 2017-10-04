const expect = require('chai').expect;

const Container = require('../../../src/Kernel/Container');

describe('Container', () => {
  const container = new Container();

  it('should bind function', () => {
    function fn() {
      return 42;
    }

    container.bind('App/Fn', fn);

    expect(container.bindings.has('App/Fn')).to.eql(true);
  });
});
