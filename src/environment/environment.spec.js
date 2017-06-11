describe("An Environment", function() {

    var environment;

    beforeEach(function() {
        environment = new Environment();
    });

    afterEach(function() {
        environment = null;
    });

    it("should set name on creation", function() {
        environment = new Environment("name");

        expect(environment.name()).toBe("name");
    });

    describe("addHost", function() {

        it("should add a host alphabetic order", function() {
            environment.addHost("host1");
            environment.addHost("host3");
            environment.addHost("beta-host2");
            environment.addHost("alpha-host2");

            expect(environment.hostGroups()[0].name()).toBe("alpha-host2");
            expect(environment.hostGroups()[1].name()).toBe("beta-host2");
            expect(environment.hostGroups()[3].name()).toBe("host3");
            expect(environment.hostGroups()[2].name()).toBe("host1");
        });
    });
});