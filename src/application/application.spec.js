describe("An Application", function() {

    var application;

    beforeEach(function() {
        application = new Application();
    });

    afterEach(function() {
        application = null;
    });

    describe("creation", function() {

        it("should set name on creation if given string", function() {
            application = new Application("name");

            expect(application.name()).toBe("name");
        });

        it("should set name and add environments on creation if given object", function() {
            application = new Application({name: "name", environments: [{name: "env1"}, {name: "env2"}]});

            expect(application.name()).toBe("name");
            expect(application.environments()[0].name()).toBe("env1");
            expect(application.environments()[0].name()).toBe("env2");
        });
    });
});