describe("AutoInjection", function() {
    beforeEach(function() {
        this.container = intravenous.create();

        var names = ["a", "a2", "a3"];
        for (var t=0;t<names.length;t++) {
            var name = names[t];
            this[name] = {
                data: name
            };
            this.container.register(name, this[name]);
        };
    });
    describe("supports multiple arguments", function() {
        beforeEach(function() {
            this.b3  = function (a, a2, a3) {
                this.a = a;
                this.a2 = a2;
                this.a3 = a3;
            };
            this.container.register("b3", this.b3);
            
            this.retrievedB = this.container.get("b3"); 
        });

        it("to inject the correct number of dependencies", function () {
            expect(this.retrievedB.a).toBeDefined();
            expect(this.retrievedB.a2).toBeDefined(); 
            expect(this.retrievedB.a3).toBeDefined(); 
        });

        it("to be injected", function () {
            expect(this.retrievedB.a).toBe(this.a);
            expect(this.retrievedB.a2).toBe(this.a2); 
            expect(this.retrievedB.a3).toBe(this.a3); 
        });
    });
    describe("supports the container", function() {
        beforeEach(function() {
            this.b2  = function (a, a2, container) {
                this.a = a;
                this.a2 = a2;
                this.container = container;
            };
            this.container.register("b2", this.b2);

            this.retrievedB = this.container.get("b2");
        });

        it("to inject the correct number of dependencies", function() {
            expect(this.retrievedB.container).toBeDefined();
        });

        it("to be injected", function() {
            expect(this.retrievedB.container).toBe(this.container);
        });
    });

    describe("supports unknown dependencies", function() {
        beforeEach(function() {
            this.b  = function (a4) {
                this.a4 = a4;
            };

            this.container.register("b", this.b);
        });
        it("to throw an exception when injected", function() {
            var _this = this;
            expect(function() { _this.retrievedB = _this.container.get("b"); }).toThrow("Unknown dependency: a4");
        });
    });
    
    describe("does not support circular references", function() {
        beforeEach(function() {
            this.b  = function (c) {
                this.c = c;
            };

            this.c = function(b) {
                this.b = b;
            };
            
            this.container.register("b", this.b)
            this.container.register("c", this.c);
        });

        it("to be injected", function() {
            var _this = this;
            expect(function() { _this.retrievedB = _this.container.get("b"); }).toThrow("Circular reference: b --> c --> b");
        });
    });

    describe("does not support circular references in multiple levels", function() {
        beforeEach(function() {
            this.b  = function (c) {
                this.c = c;
            };
            
            this.container.register("b", this.b);

            this.c = function(d) {
                this.d = d;
            };

            this.container.register("c", this.c);

            this.d = function(b) {
                this.b = b;
            };

            this.container.register("d", this.d);
        });

        it("to be injected", function() {
            var _this = this;
            expect(function() { _this.retrievedB = _this.container.get("b"); }).toThrow("Circular reference: b --> c --> d --> b");
        });
    });

    describe("does not autoinject if extra parameters are passed in", function() {
        beforeEach(function() {
            this.b  = function (a) {
                this.a = a;
                this.arguments = arguments;
            };
            
            this.container.register("b", this.b);
            this.retrievedB = this.container.get("b", "extra1", "extra2", "extra3");
        });

        it("to inject the correct number of dependencies", function() {
            expect(this.retrievedB.arguments.length).toBe(3);
        });

        it("to be injected", function() {
            expect(this.retrievedB.arguments[0]).toBe("extra1");
            expect(this.retrievedB.arguments[1]).toBe("extra2");
            expect(this.retrievedB.arguments[2]).toBe("extra3");
        });
    });

    describe("does support a hash object to autoinject extra parameters", function() {
        beforeEach(function() {
            this.test = function(a, b, c) {
                this.a = a;
                this.b = b;
                this.c = c;
            };


            this.container.register("test", this.test);

            this.retrieved = this.container.get("test", {b: "b", c: "c"});
        });

        it("should pull from registered and passed", function () {
            expect(this.retrieved).toBeDefined();
            expect(this.retrieved.a).toBeDefined();
            expect(this.retrieved.b).toBeDefined();
            expect(this.retrieved.c).toBeDefined();

            expect(this.retrieved.b).toEqual("b");
            expect(this.retrieved.c).toEqual("c");
        });
    });
});
