var page = {save: function() {} };

describe("Item", function() {

    var item;

    beforeEach(function() {
        item = new Item();
    });

    afterEach(function() {
        item = null;
    });

    describe("creation", function() {

        it("should call import if created with import data", function() {
            spyOn(Item.prototype, "import").and.stub();

            var importData = {};

            item = new Item(importData);

            expect(item.import).toHaveBeenCalledWith(importData);
        });
    });

    describe("import", function() {

        var data;

        beforeEach(function() {
            data = {};
        });

        afterEach(function() {
            data = null;
        });

        it("should set name as observable from data", function() {
            data.name = "some-item";

            item.import(data);

            expect(item.name()).toBe("some-item");
        });

        it("should set children from data with given child type", function() {
            data.childrenType = "environments";
            data.environments = [{
                name: "child1",
                isExpanded: false
            }, {
                name: "child2",
                childrenType: "hostGroups",
                isExpanded: false,
                hostGroups: [{
                    name: "host-group",
                    isExpanded: false
                }]
            }];

            item.import(data);

            expect(item.childrenType).toBe(Item.ChildrenTypes.ENV);
            expect(item.children()[0].name()).toBe("child1");
            expect(item.children()[1].name()).toBe("child2");
            expect(item.children()[1].childrenType).toBe(Item.ChildrenTypes.HOST_GROUP);
            expect(item.children()[1].children()[0].name()).toBe("host-group");
        });

        it("should set children as empty list if no given child type", function() {
            item.import(data);

            expect(item.childrenType).toBe(undefined);
            expect(item.children().length).toBe(0);
        });

        it("should set isExpanded from data", function() {
            data.isExpanded = true;

            item.import(data);

            expect(item.isExpanded()).toBe(true);
        });

        it("should set isActive from data", function() {
            data.isActive = true;

            item.import(data);

            expect(item.isActive()).toBe(true);
        });

        it("should set parent on children", function() {
            data.childrenType = "environments";
            data.environments = [{
                name: "child1",
                isExpanded: false,
                childrenType: "hostGroups",
                hostGroups: [{
                    name: "host-group",
                    isExpanded: false
                }]
            }];

            item.import(data);

            expect(item.children()[0].parent).toBe(item);
            expect(item.children()[0].children()[0].parent).toBe(item.children()[0]);
        });

        it("should set parent if given", function() {
            var parent = new Item({name: "parent"});
            item.import({parent: parent});

            expect(item.parent).toBe(parent);
        });
    });

    describe("export", function() {

        var exportData;

        beforeEach(function() {
            var child1 = new Item({name: "child1", isExpanded: false});
            var child2 = new Item({name: "child2", isExpanded: false});
            child2.childrenType = Item.ChildrenTypes.HOST_GROUP;
            child2.children = ko.observableArray([new Item({name: "host-group", isExpanded: false, isActive: true})]);

            item.name = ko.observable("some-item");
            item.childrenType = Item.ChildrenTypes.ENV;
            item.children = ko.observableArray([child1, child2]);

            exportData = item.export();
        });

        afterEach(function() {
            exportData = null;
        });

        it("should include name", function() {
            expect(exportData.name).toBe(item.name());
        });

        it("should include isExpanded", function() {
            expect(exportData.isExpanded).toBe(item.isExpanded());
        });

        it("should include isActive", function() {
            expect(exportData.isActive).toBe(item.isActive());
        });

        it("should include childrenType if childrenType exists", function() {
            expect(exportData.childrenType).toBe(item.childrenType);
        });

        it("should not include childrenType or children if childrenType does not exist", function() {
            item.childrenType = null;
            exportData = item.export();

            expect(exportData.childrenType).toBe(undefined);
            expect(exportData.environments).toBe(undefined);
        });

        it("should include data from all children if childrenType exists", function() {
            expect(exportData.environments[0].name).toBe("child1");
            expect(exportData.environments[1].name).toBe("child2");
            expect(exportData.environments[1].childrenType).toBe("hostGroups");
            expect(exportData.environments[1].hostGroups[0].name).toBe("host-group");
        });
    });

    describe("addChild", function() {

        it("should add to children with newChildName in order", function() {
            item.newChildName("alpha-newChild");

            item.addChild();

            item.newChildName("charlie-newChild");
            item.addChild();

            item.newChildName("beta-newChild");
            item.addChild();

            expect(item.children()[0].name()).toBe("alpha-newChild");
            expect(item.children()[1].name()).toBe("beta-newChild");
            expect(item.children()[2].name()).toBe("charlie-newChild");
        });

        it("should clear newChildName", function() {
            item.newChildName("newChild");

            item.addChild();

            expect(item.newChildName()).toBe(null);
        });

        it("should not duplicate item", function() {
            item.import({
                name: "item",
                childrenType: Item.ChildrenTypes.HOST_GROUP,
                hostGroups: [{
                    name: "existingChild",
                    childrenType: Item.ChildrenTypes.HOST,
                    hosts: [{
                        name: "sub-child"
                    }]
                }]
            });

            item.newChildName("existingChild");

            item.addChild();

            expect(item.children().length).toBe(1);
            expect(item.children()[0].children().length).toBe(1);
        });

        it("should save page", function() {
            spyOn(page, "save").and.stub();

            item.addChild();

            expect(page.save).toHaveBeenCalled();
        });

        it("should set parent", function() {
            item.newChildName("child");

            item.addChild();

            expect(item.children()[0].parent).toBe(item);
        });

        it("should set next childrenType based on parent", function() {
            item.newChildName("child");
            item.childrenType = Item.ChildrenTypes.APP;

            item.addChild();

            expect(item.children()[0].childrenType).toBe(Item.ChildrenTypes.ENV);
        });

        it("should set isExpanded=true", function() {
            item.newChildName("child");

            item.addChild();

            expect(item.children()[0].isExpanded()).toBe(true);
        });
    });

    describe("findChildByName", function() {

        it("should return child with given name", function() {
            var child = new Item({name: "child"});
            item.children.push(child);

            expect(item.findChildByName("child")).toBe(child);
        });
    });

    describe("getId", function() {

        it("should return without parent name if no parent", function() {
            item.name("app");

            expect(item.getId()).toBe("app");
        });

        it("should return with parent names if parents", function() {
            var app = new Item({name: "app"});
            var env = new Item({name: "env"});
            env.parent = app;

            expect(env.getId()).toBe("app-env");

            item.name("hostGroup");
            item.parent = env;

            expect(item.getId()).toBe("app-env-hostGroup");
        });
    });

    describe("getChildrenNames", function() {

        it("should return a list of all child names", function() {
            item.newChildName("beta-child");
            item.addChild();
            item.newChildName("alpha-child");
            item.addChild();

            expect(item.getChildrenNames()[0]).toBe("alpha-child");
            expect(item.getChildrenNames()[1]).toBe("beta-child");
        });
    });

    describe("getNextChildrenType", function() {

        it("should return ENV if APP", function() {
            item.childrenType = Item.ChildrenTypes.APP;

            expect(item.getNextChildrenType()).toBe(Item.ChildrenTypes.ENV);
        });

        it("should return HOST_GROUP if ENV", function() {
            item.childrenType = Item.ChildrenTypes.ENV;

            expect(item.getNextChildrenType()).toBe(Item.ChildrenTypes.HOST_GROUP);
        });

        it("should return HOST if HOST_GROUP", function() {
            item.childrenType = Item.ChildrenTypes.HOST_GROUP;

            expect(item.getNextChildrenType()).toBe(Item.ChildrenTypes.HOST);
        });
    });

    describe("isActive", function() {

        it("should set isExpanded=true if isActive changed to true", function() {
            item.isExpanded(false);

            item.isActive(true);

            expect(item.isExpanded()).toBe(true);
        });

        it("should not change if isActive changed to false", function() {
            item.isExpanded(false);

            item.isActive(false);

            expect(item.isExpanded()).toBe(false);

            item.isExpanded(true);

            item.isActive(false);

            expect(item.isExpanded()).toBe(true);
        });
    });

    describe("removeChild", function() {

        it("should remove the given child", function() {
            var child = new Item({});
            item.children([child]);

            item.removeChild(child);

            expect(item.children().length).toBe(0);
        });
    });
});