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
});