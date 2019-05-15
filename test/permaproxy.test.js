const permaproxy = require('../lib/permaproxy');

describe('permaproxy', () => {
  let obj;
  let proxy;

  beforeEach(() => {
    proxy = permaproxy(() => obj);
  });

  describe('when getter returns falsy value', () => {
    beforeEach(() => { obj = null; });

    it('should function as an empty object', () => {
      expect(proxy.unexisting).toBe(undefined);
      expect(proxy.hasOwnProperty('unexisting')).toBe(false);
      expect('unexisting' in proxy).toBe(false);
    });

    it('should remember changes to it', () => {
      proxy.someProp = 42;
      suiteDeleteProperty('someProp', 42);
    });
  });

  describe('when getter returns an object', () => {
    beforeEach(() => { obj = new Foo(); });

    it('should return prototype of that object', () => {
      expect(Object.getPrototypeOf(proxy)).toMatchSnapshot();
    });

    it('should bind functions we get', () => {
      const { getVal } = proxy;
      expect(getVal()).toBe(proxy.val);
    });

    it('should allow setting prototype', () => suiteSetPrototype());
    it('should allow deleting property', () => suiteDeleteProperty('val', 100500));
    it('should allow preventing extensions', () => suitePreventExtensions());
    it('should allow defining properties', () => suiteDefineProperty('some', 777));
    it('should allow enumerating keys', () => suiteEnumeratingKeys('val'));

    class Foo {
      constructor() {
        this.val = 100500;
      }

      bar() { return 42; }
      get baz() { return 1; }
      getVal() { return this.val; }
    }
  });

  function suiteSetPrototype() {
    Object.setPrototypeOf(proxy, { a: 5 });
    expect(proxy.a).toBe(5);
  }

  function suiteDeleteProperty(key, value) {
    expect(key in proxy).toBe(true);
    expect(proxy.hasOwnProperty(key)).toBe(true);
    expect(proxy[key]).toBe(value);

    delete proxy[key];

    expect(proxy[key]).toBe(undefined);
    expect(key in proxy).toBe(false);
    expect(proxy.hasOwnProperty(key)).toBe(false);
  }

  function suitePreventExtensions() {
    expect(Object.isExtensible(proxy)).toBe(true);
    try { Object.preventExtensions(proxy); } catch (e) {}
  }

  function suiteDefineProperty(key, value) {
    Object.defineProperty(proxy, key, {
      get: () => value,
    });

    expect(proxy[key]).toBe(value);
  }

  function suiteEnumeratingKeys(...keys) {
    expect(Object.keys(proxy)).toEqual(keys);
  }
});
