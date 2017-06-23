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

        it("should set editMode=true if local storage does not exist", function() {
            page.load();

            expect(page.editMode()).toBe(true);
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
    });

    describe("cancelEdit", function() {

        it("should load then turn off edit mode", function() {
            page.editMode(true);
            spyOn(page, "load").and.stub();

            page.cancelEdit();

            expect(page.load).toHaveBeenCalled();
            expect(page.editMode()).toBe(false);
        });
    });

    describe("activateItem", function() {

        var itemSuffix = 0;

        var createItem = function(name, childrenType, parent) {
            var item = new Item({name: name});
            item.childrenType = childrenType;
            item[childrenType] = [];
            item.parent = parent;
            return item;
        };

        var createApp = function() {
            return createItem("app" + itemSuffix++, Item.ChildrenTypes.ENV);
        }

        var createEnv = function() {
            var app = createApp();
            return createItem("env" + itemSuffix++, Item.ChildrenTypes.HOST_GROUP, app);
        }

        var createHostGroup = function() {
            var env = createEnv();
            return createItem("host-group" + itemSuffix++, Item.ChildrenTypes.HOST, env);
        }

        it("should set activeApp if childrenType is ENV", function() {
            var item = createApp();

            page.activateItem(item);

            expect(page.activeApp()).toBe(item);
        });

        it("should set activeApp if childrenType is HOST_GROUP", function() {
            var env = createEnv();

            page.activateItem(env);

            expect(page.activeApp()).toBe(env.parent);
            expect(page.activeEnv()).toBe(env);
        });

        it("should set activeEnv and activeApp if childrenType is HOST", function() {
            var hostGroup = createHostGroup();

            page.activateItem(hostGroup);

            expect(page.activeApp()).toBe(hostGroup.parent.parent);
            expect(page.activeEnv()).toBe(hostGroup.parent);
            expect(page.activeHostGroup()).toBe(hostGroup);
        });

        describe("setting isActive", function() {

            it("should set new item isActive=true and old isActive=false if app", function() {
                var item1 = createApp();
                var item2 = createApp();

                page.activateItem(item1);

                expect(page.activeApp()).toBe(item1);
                expect(item1.isActive()).toBe(true);
                expect(item2.isActive()).toBe(false);

                page.activateItem(item2);

                expect(page.activeApp()).toBe(item2);
                expect(item1.isActive()).toBe(false);
                expect(item2.isActive()).toBe(true);
            });

            it("should set new item isActive=true and old isActive=false if env", function() {
                var item1 = createEnv();
                var item2 = createEnv();

                page.activateItem(item1);

                expect(page.activeEnv()).toBe(item1);
                expect(item1.isActive()).toBe(true);
                expect(item2.isActive()).toBe(false);

                page.activateItem(item2);

                expect(page.activeEnv()).toBe(item2);
                expect(item1.isActive()).toBe(false);
                expect(item2.isActive()).toBe(true);
            });

            it("should set new item isActive=true and old isActive=false if host-group", function() {
                var item1 = createHostGroup();
                var item2 = createHostGroup();

                page.activateItem(item1);

                expect(page.activeHostGroup()).toBe(item1);
                expect(item1.isActive()).toBe(true);
                expect(item2.isActive()).toBe(false);

                page.activateItem(item2);

                expect(page.activeHostGroup()).toBe(item2);
                expect(item1.isActive()).toBe(false);
                expect(item2.isActive()).toBe(true);
            });
        });
    });

    describe("showHostGroupHealth", function() {
        // TODO
    });

    describe("showRefreshIcon", function() {
        // TODO
    });

    describe("refresh", function() {
        // TODO
    });
});