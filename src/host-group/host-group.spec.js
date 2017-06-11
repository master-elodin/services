describe("A Host Group", function() {

    var hostGroup;

    beforeEach(function() {
        hostGroup = new HostGroup();
    });

    afterEach(function() {
        hostGroup = null;
    });

    it("should set name on creation", function() {
        hostGroup = new HostGroup("name");

        expect(hostGroup.name()).toBe("name");
    });

    describe("addHost", function() {

        it("should add host in alphabetic order based on name", function() {
            hostGroup.addHost("charlie");
            hostGroup.addHost("beta");
            hostGroup.addHost("alpha");

            expect(hostGroup.hosts()[0].name()).toBe("alpha");
            expect(hostGroup.hosts()[1].name()).toBe("beta");
            expect(hostGroup.hosts()[2].name()).toBe("charlie");
        });
    });
});