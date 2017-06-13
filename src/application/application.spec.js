describe("An Application", function() {

    var application;

    beforeEach(function() {
        application = new Application();
    });

    afterEach(function() {
        application = null;
    });

    describe("addEnvironment", function() {

        it("should add and return new environment", function() {
            var env = application.addEnvironment("env");

            expect(env.name()).toBe("env");
            expect(application.environments()[0]).toBe(env);
        });
    });
});