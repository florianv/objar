(function (define) {
    define('objar', function () {

        function Objar() {
            this.definitions = [];
            this.resolved = [];
            this.resolving = [];
        }

        /**
         * Defines a service.
         *
         * @param {String}   name       The service name
         * @param {Function} definition A function returning a service instance
         *
         * @returns {Objar}
         */
        Objar.prototype.define = function (name, definition) {
            if (!isFunction(definition)) {
                throw new Error('The service "' + name + '" definition must be a function');
            }

            this.definitions[name] = definition;

            return this;
        };

        /**
         * Checks if the given service is defined.
         *
         * @param {String} name The service name
         *
         * @return {Boolean}
         */
        Objar.prototype.isDefined = function (name) {
            return undefined !== this.definitions[name];
        };

        /**
         * Resolves a service instance.
         *
         * @param {String} name The service name
         *
         * @return {*} The service
         */
        Objar.prototype.resolve = function (name) {
            for (var i = 0; i < this.resolving.length; i++) {
                var serviceName = this.resolving[i];

                if (undefined !== this.resolved[serviceName]) {
                    delete this.resolving[i];
                }
            }

            if (undefined !== this.resolved[name]) {
                return this.resolved[name];
            }

            if (-1 !== this.resolving.indexOf(name)) {
                var path = this.resolving.concat(this.resolving[0]);
                throw new Error('Circular dependency detected: ' + path.join(' -> '));
            }

            this.resolving.push(name);

            var definition = this.definitions[name];

            if (undefined === definition) {
                throw new Error('The service "' + name + '" is not defined');
            }

            var service = definition.apply(this);

            if (undefined === service) {
                throw new Error('The definition of the service "' + name + '" must return it');
            }

            return this.resolved[name] = service;
        };

        /**
         * Invokes an annotated function with its dependencies resolved (AngularJS style).
         *
         * @param {Array} annotated An annotated function
         *
         * @return {*} The result of the function call
         */
        Objar.prototype.invoke = function (annotated) {
            if (!annotated instanceof Array || annotated.length < 2) {
                throw new Error('Objar.invoke() expects an annotated function');
            }

            var callable = annotated.pop();
            var args = [];

            if (!isFunction(callable)) {
                throw new Error('Objar.invoke() expects an annotated function');
            }

            for (var i = 0; i < annotated.length; i++) {
                var serviceName = annotated[i];
                args.push(this.resolve(serviceName));
            }

            return callable.apply(null, args);
        };

        function isFunction(obj) {
            return !!(obj && typeof obj.constructor !== "undefined" && typeof obj.call !== "undefined" && typeof obj.apply !== "undefined");
        }

        return Objar;
    });
}(typeof define === 'function' && define.amd ? define : function (objar, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require);
    } else {
        window[objar] = factory(function (value) {
            return window[value];
        });
    }
}));
