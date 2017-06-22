// set SCRIPT_VERSION here because it's set in the templates by the build
var SCRIPT_VERSION = "1.0.0";

describe("A Page", function() {

    var page;

    beforeEach(function() {
        page = new Page();
        localStorage.removeItem(Page.DATA_NAME);
    });

    afterEach(function() {
        page = null;
    });

    describe("load", function() {

        it("should read from local storage if local storage exists", function() {
            localStorage.setItem(Page.DATA_NAME, 
            '{"applications":[' +
                '{"name":"app","environments":[' + 
                    '{"name":"env","hostGroups":[' +
                        '{"name":"group1","hosts":[' +
                            '{"name":"host1"},{"name":"host2"}],"services": []},' +
                        '{"name":"group2","hosts":[' +
                            '{"name":"host3"},{"name":"host4"}],"services": [' +
                                '{"name": "service1", "instancesByHost": { "host3": [' +
                                    '{"id": "id1", "version": "1.2.3"}' +
                                ']}}' +
                            ']}' +
                        ']}' +
                    ']}' +
                ']}');

            page.load();

            expect(page.applications().length).toBe(1);
            expect(page.applications()[0].name()).toBe("app");
            var env = page.applications()[0].environments()[0];
            expect(env.name()).toBe("env");
            expect(env.hostGroups()[0].name()).toBe("group1");
            expect(env.hostGroups()[0].hosts()[0].name()).toBe("host1");

            expect(env.hostGroups()[1].services()[0].name()).toBe("service1");
            expect(env.hostGroups()[1].services()[0].instancesByHost()["host3"][0].id()).toBe("id1");
            expect(env.hostGroups()[1].services()[0].instancesByHost()["host3"][0].version()).toBe("1.2.3");

            expect(env.hostGroups()[1].name()).toBe("group2");
        });

        it("should read 'isActive' from local storage for app, env, and hostGroup", function() {
            var savedData = {
                applications: [
                    {name: "app", 
                    isActive: true, 
                    environments: [
                        {name:"env", 
                        isActive: true, 
                        hostGroups:[
                            {name: "group1",
                            isActive: true,
                            hosts: [
                                {name: "host1"},
                                {name: "host2"}
                            ],
                            services: []}
                        ]}
                    ]}
                ]
            };
            localStorage.setItem(Page.DATA_NAME, JSON.stringify(savedData));

            page.load();

            var app = page.applications()[0];
            var env = app.environments()[0];
            var hostGroup = env.hostGroups()[0];
            expect(app.isActive()).toBe(true);
            expect(env.isActive()).toBe(true);
            expect(hostGroup.isActive()).toBe(true);
        });

        it("should set activeApp from local storage", function() {
            var savedData = {
                applications: [
                    {name: "app", 
                    isActive: true, 
                    environments: [
                        {name:"env", 
                        isActive: true, 
                        hostGroups:[
                            {name: "group1",
                            isActive: true,
                            hosts: [
                                {name: "host1"},
                                {name: "host2"}
                            ],
                            services: []}
                        ]}
                    ]}
                ],
                activeApp: {name: "app"}
            };
            localStorage.setItem(Page.DATA_NAME, JSON.stringify(savedData));

            page.load();

            expect(page.activeApp()).toBe(page.applications()[0]);
        });

        it("should not read from local storage if local storage does not exist", function() {
            page.load();

            expect(page.applications().length).toBe(0);
        });

        it("should set editMode=true if local storage does not exist", function() {
            page.load();

            expect(page.editMode()).toBe(true);
        });
    });

    describe("save", function() {

        var parentApp;
        var parentEnv;
        var hostGroup;

        beforeEach(function() {
            parentApp = new Application({name: "app", page: page});
            parentEnv = new Environment({name: "env", page: page, parent: parentApp});
            hostGroup = new HostGroup({name: "host-group", page: page, parent: parentEnv});
        });

        afterEach(function() {
            parentApp = null;
            parentEnv = null;
            hostGroup = null;
        });

        it("should not include non-knockout functions", function() {
            spyOn(localStorage, "setItem").and.stub();
            page.addApplication("app1");
            page.activateItem(hostGroup);

            page.save();

            var savedData = JSON.parse(localStorage.setItem.calls.first().args[1]);
            // just picking a few methods to make sure they don't exist
            expect(savedData.addApplication).toBe(undefined);
            expect(savedData.toggleEdit).toBe(undefined);
            expect(savedData.activateItem).toBe(undefined);
            // don't save activeApp/env/hostGroup because that's already being saved as isActive
            expect(savedData.activeApp).toBe(undefined);
            expect(savedData.activeEnv).toBe(undefined);
            expect(savedData.activeHostGroup).toBe(undefined);
            // make sure variables do exist
            expect(savedData.applications).not.toBe(undefined);
            expect(savedData.applications[0].name).toBe("app1");
        });
    });

    describe("addApplication", function() {
        
        it("should add application with given name to applications", function() {
            page.addApplication("name");

            expect(page.applications().length).toBe(1);
            expect(page.applications()[0].name()).toBe("name");
        });
    });

    describe("toggleEdit", function() {

        it("should reverse value of editMode", function() {
            page.editMode(true);

            page.toggleEdit();

            expect(page.editMode()).toBe(false);

            page.toggleEdit();

            expect(page.editMode()).toBe(true);
        });

        it("should save to localStorage if no longer editing", function() {
            page.editMode(true);
            spyOn(page, "save").and.stub();

            page.toggleEdit();

            expect(page.save).toHaveBeenCalled();
        });

        it("should not save to localStorage if editing", function() {
            page.editMode(false);
            spyOn(page, "save").and.stub();

            page.toggleEdit();

            expect(page.save).not.toHaveBeenCalled();
        });

        it("should re-activate host-group if existing activeHostGroup and no longer editing", function() {
            var hostGroup = jasmine.createSpy();
            page.activeHostGroup(hostGroup);
            page.editMode(true);
            spyOn(page, "activateItem").and.stub();

            page.toggleEdit();

            expect(page.activateItem).toHaveBeenCalledWith(hostGroup);
        });

        it("should re-activate host-group if no existing activeHostGroup", function() {
            page.activeHostGroup(null);
            page.editMode(true);
            spyOn(page, "activateItem").and.stub();

            page.toggleEdit();

            expect(page.activateItem).not.toHaveBeenCalled();
        });
    });

    describe("cancelEdit", function() {
        
        it("should load then turn off edit mode", function() {
            page.editMode(true);
            spyOn(page, "load").and.stub();

            page.cancelEdit();

            expect(page.load).toHaveBeenCalled();
            expect(page.editMode()).toBe(false);
        });
        
        it("should not duplicate anything", function() {
            var savedData = {
                applications: [
                    {name: "app", 
                    isActive: true, 
                    environments: [
                        {name:"env", 
                        isActive: true, 
                        hostGroups:[
                            {name: "group1",
                            isActive: true,
                            hosts: [
                                {name: "host1"},
                                {name: "host2"}
                            ],
                            services: []}
                        ]}
                    ]}
                ]
            };
            localStorage.setItem(Page.DATA_NAME, JSON.stringify(savedData));
            page.load();

            page.cancelEdit();

            expect(page.applications().length).toBe(1);
        });
    });

    describe("activateItem", function() {

        describe("for Application", function() {
            var app;

            beforeEach(function() {
                app = new Application({name: "app", page: page});
            });

            afterEach(function() {
                app = null;
            });

            it("should set as activeApp and set isActive=true", function() {
                page.activateItem(app);

                expect(page.activeApp()).toBe(app);
                expect(app.isActive()).toBe(true);
            });

            it("should remove activeEnv and activeHostGroup if app changes", function() {
                page.activeEnv(new Environment({name: "env", page: page}));
                page.activeHostGroup(new HostGroup({name: "host-group", page: page}));

                page.activateItem(app);

                expect(page.activeEnv()).toBe(null);
                expect(page.activeHostGroup()).toBe(null);
            });

            it("should set previous activeApp isActive=false previous activeApp", function() {
                var previous = new Application({name: "old", page: page});
                previous.isActive(true);
                page.activeApp(previous);

                page.activateItem(app);

                expect(page.activeApp()).toBe(app);
                expect(app.isActive()).toBe(true);
                expect(previous.isActive()).toBe(false);
            });
        });

        describe("for Environment", function() {
            var env;
            var parentApp;

            beforeEach(function() {
                parentApp = new Application({name: "app", page: page});
                env = new Environment({name: "env", page: page, parent: parentApp});
            });

            afterEach(function() {
                parentApp = null;
                env = null;
            });

            it("should set as activeEnv and set isActive=true", function() {
                page.activateItem(env);

                expect(page.activeEnv()).toBe(env);
                expect(env.isActive()).toBe(true);
            });

            it("should set parent as activeApp", function() {
                page.activateItem(env);

                expect(page.activeApp()).toBe(parentApp);
                expect(page.activeEnv()).toBe(env);
            });

            it("should remove activeHostGroup if env changes", function() {
                page.activeHostGroup(new HostGroup({name: "host-group", page: page}));

                page.activateItem(env);

                expect(page.activeHostGroup()).toBe(null);
            });

            it("should set previous activeEnv isActive=false and previous activeEnv", function() {
                var previous = new Environment({name: "env-old", page: page});
                previous.isActive(true);
                page.activeEnv(previous);

                page.activateItem(env);

                expect(page.activeEnv()).toBe(env);
                expect(env.isActive()).toBe(true);
                expect(previous.isActive()).toBe(false);
            });
        });

        describe("for HostGroup", function() {
            var parentApp;
            var parentEnv;
            var hostGroup;

            beforeEach(function() {
                parentApp = new Application({name: "app", page: page});
                parentEnv = new Environment({name: "env", page: page, parent: parentApp});
                hostGroup = new HostGroup({name: "host-group", page: page, parent: parentEnv});
            });

            afterEach(function() {
                parentApp = null;
                parentEnv = null;
                hostGroup = null;
            });

            it("should set as activeHostGroup and set isActive=true if HostGroup", function() {
                page.activateItem(hostGroup);

                expect(page.activeHostGroup()).toBe(hostGroup);
                expect(hostGroup.isActive()).toBe(true);
            });

            it("should set previous activeHostGroup isActive=false if HostGroup and previous activeHostGroup", function() {
                var previous = new HostGroup({name: "host-group-old", page: page, parent: parentEnv});
                previous.isActive(true);
                page.activeHostGroup(previous);

                page.activateItem(hostGroup);

                expect(page.activeHostGroup()).toBe(hostGroup);
                expect(hostGroup.isActive()).toBe(true);
                expect(previous.isActive()).toBe(false);
            });

            it("should select parent environment and app", function() {

                page.activateItem(hostGroup);

                expect(page.activeApp()).toBe(parentApp);
                expect(page.activeEnv()).toBe(parentEnv);
                expect(page.activeHostGroup()).toBe(hostGroup);
            });
        });
    });

    describe("showHostGroupHealth", function() {

        it("should return true if showRefreshIcon and no activeService", function() {
            spyOn(page, "showRefreshIcon").and.returnValue(true);
            page.activeService(null);

            expect(page.showHostGroupHealth()).toBe(true);
        });

        it("should return false if activeService", function() {
            spyOn(page, "showRefreshIcon").and.returnValue(true);
            page.activeService({});

            expect(page.showHostGroupHealth()).toBe(false);
        });
    });

    describe("showRefreshIcon", function() {

        it("should return true if host-group is selected", function() {
            var parentApp = new Application({name: "app", page: page});
            var parentEnv = new Environment({name: "env", page: page, parent: parentApp});

            page.activateItem(new HostGroup({name: "host-group", page: page, parent: parentEnv}));

            expect(page.showRefreshIcon()).toBe(true);
        });

        it("should return false if no host-group is selected", function() {
            page.activeHostGroup(null);

            expect(page.showRefreshIcon()).toBe(false);
        });

        it("should return false if editMode=true", function() {
            var parentApp = new Application({name: "app", page: page});
            var parentEnv = new Environment({name: "env", page: page, parent: parentApp});

            page.activateItem(new HostGroup({name: "host-group", page: page, parent: parentEnv}));

            page.editMode(true);

            expect(page.showRefreshIcon()).toBe(false);
        });
    });

    describe("refresh", function() {

        var activeHostGroup;

        beforeEach(function() {
            var parentApp = new Application({name: "app", page: page});
            var parentEnv = new Environment({name: "env", page: page, parent: parentApp});
            activeHostGroup = new HostGroup({name: "host-group", page: page, parent: parentEnv});
            page.activateItem(activeHostGroup);
        });

        afterEach(function() {
            activeHostGroup = null;
        });

        it("should call activeHostGroup.loadData if not refreshing when clicked", function() {
            page.isRefreshing(false);
            spyOn(activeHostGroup, "loadData").and.callFake(function(){ return jQuery.Deferred().resolve();});

            page.refresh();

            expect(activeHostGroup.loadData).toHaveBeenCalled();
        });

        it("should set isRefreshing=true if not refreshing and has activeHostGroup when clicked", function() {
            page.isRefreshing(false);

            page.refresh();

            expect(page.isRefreshing()).toBe(true);
        });

        it("should not set isRefreshing=true if no activeHostGroup", function() {
            page.isRefreshing(false);
            page.activeHostGroup(null);

            page.refresh();

            expect(page.isRefreshing()).toBe(false);
        });
    });

    describe("clearAllActive", function() {

        it("should remove activeApp, activeEnv, activeHostGroup", function() {
            page.activeApp({isActive: ko.observable(true)});
            page.activeEnv({isActive: ko.observable(true)});
            page.activeHostGroup({isActive: ko.observable(true)});

            page.clearAllActive();

            expect(page.activeApp()).toBe(null);
            expect(page.activeEnv()).toBe(null);
            expect(page.activeHostGroup()).toBe(null);
        });

        it("should set isActive=false for any activeApp, activeEnv, activeHostGroup", function() {
            var activeApp = {isActive: ko.observable(true)};
            var activeEnv = {isActive: ko.observable(true)};
            page.activeApp(activeApp);
            page.activeEnv(activeEnv);
            page.activeHostGroup(null);

            page.clearAllActive();

            expect(activeApp.isActive()).toBe(false);
            expect(activeEnv.isActive()).toBe(false);

            expect(page.activeApp()).toBe(null);
            expect(page.activeEnv()).toBe(null);
            expect(page.activeHostGroup()).toBe(null);
        });
    });

    describe("isItemActive", function() {

        it("should return true if app and app is activeApp", function() {
            var app1 = page.addApplication("app1");
            page.addApplication("app2");
            page.activeApp(app1);

            expect(page.isItemActive(app1)).toBe(true);
        });

        it("should return false if app and app is not activeApp", function() {
            var app1 = page.addApplication("app1");
            var app2 = page.addApplication("app2");
            page.activeApp(app1);

            expect(page.isItemActive(app2)).toBe(false);
        });

        it("should return true if env and env is activeEnv", function() {
            var app1 = page.addApplication("app1");
            var env1 = app1.addEnvironment("env1");
            var env2 = app1.addEnvironment("env2");
            page.activeEnv(env1);

            expect(page.isItemActive(env1)).toBe(true);
        });

        it("should return false if env and env is not activeEnv", function() {
            var app1 = page.addApplication("app1");
            var env1 = app1.addEnvironment("env1");
            var env2 = app1.addEnvironment("env2");
            page.activeEnv(env1);

            expect(page.isItemActive(env2)).toBe(false);
        });

        it("should return true if hostGroup and hostGroup is activeHostGroup", function() {
            var env1 = page.addApplication("app1").addEnvironment("env1");
            var hostGroup1 = env1.addHostGroup("host-group1");
            var hostGroup2 = env1.addHostGroup("host-group2");
            page.activeHostGroup(hostGroup1);

            expect(page.isItemActive(hostGroup1)).toBe(true);
        });

        it("should return false if hostGroup and hostGroup is not activeHostGroup", function() {
            var env1 = page.addApplication("app1").addEnvironment("env1");
            var hostGroup1 = env1.addHostGroup("host-group1");
            var hostGroup2 = env1.addHostGroup("host-group2");
            page.activeHostGroup(hostGroup1);

            expect(page.isItemActive(hostGroup2)).toBe(false);
        });
    });
});