describe("Selections", function() {

    var selections;
    var loadingData;

    beforeEach(function() {
        loadingData = {
            activeApp: ko.observable(),
            activeEnv: ko.observable(),
            activeHostGroup: ko.observable(),
            applications: ko.observableArray()
        };
        selections = new Selections(loadingData);
    });

    afterEach(function() {
        selections = null;
        loadingData = null;
    });

    describe("currentOptionType", function() {

        it("should be APPLICATION if no active app", function() {
            expect(selections.currentOptionType()).toBe(Selections.OPTION_TYPES.APPLICATION);
        });

        it("should be ENVIRONMENT if active app and no active env", function() {
            loadingData.activeApp({});

            expect(selections.currentOptionType()).toBe(Selections.OPTION_TYPES.ENVIRONMENT);
        });

        it("should be HOST_GROUP if active app, active env and no active host-group", function() {
            loadingData.activeApp({});
            loadingData.activeEnv({});

            expect(selections.currentOptionType()).toBe(Selections.OPTION_TYPES.HOST_GROUP);
        });

        it("should be NONE if active app, active env and active host-group", function() {
            loadingData.activeApp({});
            loadingData.activeEnv({});
            loadingData.activeHostGroup({});

            expect(selections.currentOptionType()).toBe(Selections.OPTION_TYPES.NONE);
        });
    });

    describe("showSubHeader", function() {

        it("should return true if currentOptionType is not NONE", function() {
            selections.currentOptionType = ko.observable(Selections.OPTION_TYPES.APPLICATION);

            expect(selections.showSubHeader()).toBe(true);
        });

        it("should return false if currentOptionType is NONE", function() {
            selections.currentOptionType = ko.observable(Selections.OPTION_TYPES.NONE);

            expect(selections.showSubHeader()).toBe(false);
        });
    });

    describe("currentOptionNames", function() {

        var app1;
        var env2;

        beforeEach(function() {
            app1 = new Application({name: "app1"});
            var env1 = app1.addEnvironment("env1");
            env1.addHostGroup("host-group1");
            env1.addHostGroup("host-group2");
            env2 = app1.addEnvironment("env2");
            env2.addHostGroup("host-group3");
            var app2 = new Application({name: "app2"});
            var env3 = app2.addEnvironment("env3");
            env3.addHostGroup("host-group4");
            loadingData.applications.push(app1);
            loadingData.applications.push(app2);
        });

        it("should return possible applications if currentOptionType is APPLICATION", function() {
            expect(selections.currentOptionNames()[0]).toBe("app1");
            expect(selections.currentOptionNames()[1]).toBe("app2");
        });

        it("should return possible environments from activeApp if currentOptionType is ENVIRONMENT", function() {
            loadingData.activeApp(app1);
            
            expect(selections.currentOptionNames()[0]).toBe("env1");
            expect(selections.currentOptionNames()[1]).toBe("env2");
        });

        it("should return possible host-groups from activeEnv if currentOptionType is HOST_GROUP", function() {
            loadingData.activeApp(app1);
            loadingData.activeEnv(env2);

            expect(selections.currentOptionNames()[0]).toBe("host-group3");
        });
    });
});