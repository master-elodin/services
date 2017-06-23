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

        it("should set activeApp if childrenType is environments", function() {
            var item = new Item({name: "name", childrenType: Item.ChildrenTypes.ENV, environments: []});
            
            page.activateItem(item);

            expect(page.activeApp()).toBe(item);
        });

        it("should set activeEnv if childrenType is hostGroups", function() {
            var item = new Item({name: "name", childrenType: Item.ChildrenTypes.HOST_GROUP, hostGroups: []});
            
            page.activateItem(item);

            expect(page.activeEnv()).toBe(item);
        });

        it("should set activeHostGroup if childrenType is hosts", function() {
            var item = new Item({name: "name", childrenType: Item.ChildrenTypes.HOST, hosts: []});
            
            page.activateItem(item);

            expect(page.activeHostGroup()).toBe(item);
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