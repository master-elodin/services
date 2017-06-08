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

        expect(environment.name).toBe("name");
    });

    describe("addHost", function() {

        it("should add a host alphabetic order", function() {
            environment.addHost("host1");
            environment.addHost("host3");
            environment.addHost("beta-host2");
            environment.addHost("alpha-host2");

            expect(environment.hosts[0]).toBe("alpha-host2");
            expect(environment.hosts[1]).toBe("beta-host2");
            expect(environment.hosts[2]).toBe("host1");
            expect(environment.hosts[3]).toBe("host3");
        });
    });
});