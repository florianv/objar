var Objar = require('./objar');

describe('Objar', function () {
    var objar;

    beforeEach(function () {
        objar = new Objar();
    });

    it('should add a service definition', function () {
        expect(objar.isDefined('foo')).toBeFalsy();
        objar.define('foo', function () {
            return 'bar'
        });
        expect(objar.isDefined('foo')).toBeTruthy();
    });

    it('should throw an error when adding an invalid service definition', function () {
        expect(function () {
            objar.define('foo', 'bar')
        }).toThrow(new Error('The service "foo" definition must be a function'));
    });

    it('should throw an error when resolving a non existing service', function () {
        expect(function () {
            objar.resolve('foo')
        }).toThrow(new Error('The service "foo" is not defined'));
    });

    it('should throw an error when the service definition does not return it', function () {
        objar.define('foo', function () {});

        expect(function () {
            objar.resolve('foo')
        }).toThrow(new Error('The definition of the service "foo" must return it'));
    });

    it('should return the same instance of a service', function () {
        objar.define('foo', function () {
            return {}
        });

        var one = objar.resolve('foo');
        var second = objar.resolve('foo');

        expect(one).toBe(second);
    });

    it('should resolve a service', function () {
        //   A
        //  / \
        // v   v
        // C   B
        //  \ /
        //   v
        //   D -> E
        var calls = [];

        objar.define('E', function () {
            calls.push('E');
            return 'E';
        });

        objar.define('A', function () {
            calls.push('A');
            objar.resolve('B');
            objar.resolve('C');
            return 'A';
        });

        objar.define('B', function () {
            calls.push('B');
            this.resolve('D');
            return 'B';
        });

        objar.define('C', function () {
            calls.push('C');
            this.resolve('D');
            return 'C';
        });

        objar.define('D', function () {
            calls.push('D');
            objar.resolve('E');
            return 'D';
        });

        objar.resolve('A');

        expect(calls).toEqual(['A', 'B', 'D', 'E', 'C']);
    });

    it('should detect circular dependencies when resolving a service', function () {
        //   A -> B
        //   ^    |
        //   |    v
        //   D <- C -> E
        objar.define('A', function () {
            this.resolve('B');
            return 'A';
        });

        objar.define('B', function () {
            this.resolve('C');
            return 'B';
        });

        objar.define('E', function () {
            return 'E';
        });

        objar.define('C', function () {
            objar.resolve('D');
            objar.resolve('E');
            return 'C';
        });

        objar.define('D', function () {
            this.resolve('A');
            return 'D';
        });

        expect(function () {
            objar.resolve('A');
        }).toThrow(new Error('Circular dependency detected: A -> B -> C -> D -> A'));

        expect(function () {
            objar.resolve('B');
        }).toThrow(new Error('Circular dependency detected: A -> B -> C -> D -> A'));

        expect(function () {
            objar.resolve('C');
        }).toThrow(new Error('Circular dependency detected: A -> B -> C -> D -> A'));

        expect(function () {
            objar.resolve('D');
        }).toThrow(new Error('Circular dependency detected: A -> B -> C -> D -> A'));

        expect(objar.resolve('E')).toEqual('E');
    });

    it('should throw an error when invoking a badly annotated function', function () {
        expect(function () {
            objar.invoke(['a'])
        }).toThrow(new Error('Objar.invoke() expects an annotated function'));

        expect(function () {
            objar.invoke(['a', 'b'])
        }).toThrow(new Error('Objar.invoke() expects an annotated function'));
    });

    it('should throw an error when an annotated function needs an unexisting dependency', function () {
        expect(function () {
            objar.invoke(['a', function () {}]);
        }).toThrow(new Error('The service "a" is not defined'));
    });

    it('should invoke an annotated function with the dependencies injected', function () {
        // A -> B -> C
        objar.define('A', function () {
            this.resolve('B');
            return 'A';
        });

        objar.define('B', function () {
            this.resolve('C');
            return 'B';
        });

        objar.define('C', function () {
            return 'C';
        });

        objar.invoke(['A', 'B', 'C', function (x, y, z) {
            expect(x).toEqual('A');
            expect(y).toEqual('B');
            expect(z).toEqual('C');
        }]);
    });

});
