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

            expect(env.hostGroups()[1].services()[0].name).toBe("service1");
            expect(env.hostGroups()[1].services()[0].instancesByHost["host3"][0].id).toBe("id1");
            expect(env.hostGroups()[1].services()[0].instancesByHost["host3"][0].version).toBe("1.2.3");

            expect(env.hostGroups()[1].name()).toBe("group2");
        });

        it("should read 'isActive' from local storage", function() {
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

        it("should set activeEnv based on name if it matches activeApp", function() {
            var savedData = {
                applications: [
                    {name: "app1", 
                    isActive: true, 
                    environments: [
                        {name:"env1", 
                        isActive: true, 
                        hostGroups:[]}
                    ]},
                    {name: "app2", 
                    isActive: true, 
                    environments: [
                        {name:"env1", 
                        isActive: true, 
                        hostGroups:[]},
                        {name:"env2", 
                        isActive: true, 
                        hostGroups:[]}
                    ]}
                ],
                activeApp: {name: "app2"},
                activeEnv: {name: "env1"}
            };
            localStorage.setItem(Page.DATA_NAME, JSON.stringify(savedData));

            page.load();

            expect(page.activeEnv()).toBe(page.applications()[1].environments()[0]);
        });

        it("should set activeEnv based on name if it matches activeApp and activeEnv", function() {
            var savedData = {
                applications: [
                    {name: "app1", 
                    isActive: true, 
                    environments: [
                        {name:"env1", 
                        isActive: true, 
                        hostGroups:[]}
                    ]},
                    {name: "app2", 
                    isActive: true, 
                    environments: [
                        {name:"env1", 
                        isActive: true, 
                        hostGroups:[]},
                        {name:"env2", 
                        isActive: true, 
                        hostGroups:[{name: "group1"}]}
                    ]}
                ],
                activeApp: {name: "app2"},
                activeEnv: {name: "env1"}
            };
            localStorage.setItem(Page.DATA_NAME, JSON.stringify(savedData));

            page.load();

            expect(page.activeHostGroup()).toBe(page.applications()[1].environments()[0].hostGroups()[0]);
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

        it("should save to localStorage", function() {
            spyOn(localStorage, "setItem").and.stub();

            page.toggleEdit();

            expect(localStorage.setItem).toHaveBeenCalledWith(Page.DATA_NAME, JSON.stringify(ko.mapping.toJS(page)));
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

            it("should not remove activeEnv and activeHostGroup if app does not change", function() {
                page.activateItem(app);

                var env = new Environment({name: "env", page: page});
                var hostGroup = new HostGroup({name: "host-group", page: page});
                page.activeEnv(env);
                page.activeHostGroup(hostGroup);

                page.activateItem(app);

                expect(page.activeEnv()).toBe(env);
                expect(page.activeHostGroup()).toBe(hostGroup);
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

            beforeEach(function() {
                env = new Environment({name: "env", page: page});
            });

            afterEach(function() {
                env = null;
            });

            it("should set as activeEnv and set isActive=truehostGroup", function() {
                page.activateItem(env);

                expect(page.activeEnv()).toBe(env);
                expect(env.isActive()).toBe(true);
            });

            it("should remove activeHostGroup if env changes", function() {
                page.activeHostGroup(new HostGroup({name: "host-group", page: page}));

                page.activateItem(env);

                expect(page.activeHostGroup()).toBe(null);
            });

            it("should not remove activeHostGroup if env does not change", function() {
                page.activateItem(env);

                var hostGroup = new HostGroup({name: "host-group", page: page});
                page.activeHostGroup(hostGroup);

                page.activateItem(env);

                expect(page.activeHostGroup()).toBe(hostGroup);
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
            var hostGroup;

            beforeEach(function() {
                hostGroup = new HostGroup({name: "host-group", page: page});
            });

            afterEach(function() {
                hostGroup = null;
            });

            it("should set as activeHostGroup and set isActive=true if HostGroup", function() {
                page.activateItem(hostGroup);

                expect(page.activeHostGroup()).toBe(hostGroup);
                expect(hostGroup.isActive()).toBe(true);
            });

            it("should set previous activeHostGroup isActive=false if HostGroup and previous activeHostGroup", function() {
                var previous = new HostGroup({name: "host-group-old", page: page});
                previous.isActive(true);
                page.activeHostGroup(previous);

                page.activateItem(hostGroup);

                expect(page.activeHostGroup()).toBe(hostGroup);
                expect(hostGroup.isActive()).toBe(true);
                expect(previous.isActive()).toBe(false);
            });
        });
    });
});