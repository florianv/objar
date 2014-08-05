# objar [![Build status][travis-image]][travis-url]

> Simple and fast dependency injection container

## Installation

### Node

```bash
$ npm install objar --save
```

```js
var objar = require('objar');
var jar = new objar();
```

### Browser

```bash
$ bower install objar --save
```

```html
<script type="text/javascript" src="bower_components/objar/objar.min.js"></script>
```

```js
// Global
var jar = new objar();

// RequireJS
require(['objar'], function (objar) {
    var jar = new objar();
});
```

## Usage

### Defining and Resolving services

```js
function Logger() {
    this.log = function (message) {
        console.log('Logged: ' + message);
    };
}

function ProductController(logger) {
    this.logger = logger;

    this.saveProduct = function () {
        this.logger.log('Saved the product!');
    };
}

// Defines the 'logger' service
jar.define('logger', function () {
   return new Logger();
});

// Defines the 'controller' service depending on the 'logger' service
jar.define('controller', function () {
    return new ProductController(jar.resolve('logger'));
});

// Resolving the product controller service
var controller = jar.resolve('controller');

// => Logged: Saved the product!
controller.saveProduct();
```

The `define()` method accepts two parameters:

- the service name
- a function returning the service (it can be any value except `undefined`)

> Services are created lazily when calling the `resolve()` method and it always returns
> the same instance (singleton)

### Circular dependencies

When two services depend on each other (in)directly, an Error will be thrown showing
the cycle path in order to help you to fix it.

```js
// 'hello' depends on 'world'
jar.define('hello', function () {
    return 'hello' + jar.resolve('world');
});

// 'world' depends on 'hello'
jar.define('world', function () {
    return 'world' + jar.resolve('hello');
});

// Error: Circular dependency detected: hello -> world -> hello
jar.resolve('hello');
```

### Invoking functions

You can invoke annotated functions depending on services (AngularJS way).

```js
jar
    .define('hello', function () {
        return 'hello';
    })
    .define('world', function () {
        return 'world';
    })
;

// Invoke the function with the services injected:
// - w: will be the 'hello' service
// - h: will be the 'world' service
jar.invoke(['hello', 'world', function (h, w) {
    // => hello world
    console.log(h + ' ' + w);
}]);
```

## License

[MIT](https://github.com/florianv/objar/blob/master/LICENSE)

[travis-url]: https://travis-ci.org/florianv/objar
[travis-image]: https://travis-ci.org/florianv/objar.svg?branch=master
