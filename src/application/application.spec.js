describe("An Application", function() {

    var application;

    beforeEach(function() {
        application = new Application();
    });

    afterEach(function() {
        application = null;
    });

    it("should set name on creation", function() {
        application = new Application("name");

        expect(application.name).toBe("name");
    });
});