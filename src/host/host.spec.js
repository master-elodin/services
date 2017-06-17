describe("A Host ", function() {

    var host;

    beforeEach(function() {
        host = new Host({name: "host"});
    });

    afterEach(function() {
        host = null;
    });

    describe("creation", function() {

        it("should set name", function() {
            expect(host.name()).toBe("host");
        });
    });
});