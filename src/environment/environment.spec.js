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

    describe("addHostGroup", function() {

        it("should return host group", function() {
            var hostGroup = environment.addHostGroup("host-group");

            expect(hostGroup.name()).toBe("host-group");
            expect(environment.hostGroups()[0]).toBe(hostGroup);
        });

        it("should add a host group alphabetic order", function() {
            environment.addHostGroup("host-group1");
            environment.addHostGroup("host-group3");
            environment.addHostGroup("beta-host-group2");
            environment.addHostGroup("alpha-host-group2");

            expect(environment.hostGroups()[0].name()).toBe("alpha-host-group2");
            expect(environment.hostGroups()[1].name()).toBe("beta-host-group2");
            expect(environment.hostGroups()[3].name()).toBe("host-group3");
            expect(environment.hostGroups()[2].name()).toBe("host-group1");
        });
    });

    describe("select", function() {

        it("should set active true", function() {
            expect(environment.isActive()).toBe(false);

            environment.select();

            expect(environment.isActive()).toBe(true);
        });
    });
});