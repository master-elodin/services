describe("An Environment", function() {

    var environment;
    var page;

    beforeEach(function() {
        page = {activateItem: function(){}, save: function(){}};
        spyOn(page, "activateItem").and.stub();
        environment = new Environment({name: "env", page: page});
    });

    afterEach(function() {
        page = null;
        environment = null;
    });

    describe("addHostGroup", function() {

        it("should return host group", function() {
            var hostGroup = environment.addHostGroup("host-group");

            expect(hostGroup.name()).toBe("host-group");
            expect(environment.hostGroups()[0]).toBe(hostGroup);
        });
        
        it("should set name, page, parent when adding host group", function() {
            var hostGroup = environment.addHostGroup("host-group");

            expect(hostGroup.name()).toBe("host-group");
            expect(hostGroup.page).toBe(environment.page);
            expect(hostGroup.parent).toBe(environment);
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

        it("should toggle active", function() {
            expect(environment.isActive()).toBe(false);

            environment.select();

            expect(environment.isActive()).toBe(true);

            environment.select();

            expect(environment.isActive()).toBe(false);
        });

        it("should active item if active is true", function() {
            environment.isActive(false);

            environment.select();

            expect(page.activateItem).toHaveBeenCalledWith(environment);
        });
        
        it("should save page", function() {
            spyOn(page, "save").and.stub();

            environment.select();

            expect(page.save).toHaveBeenCalled();
        });
    });
});