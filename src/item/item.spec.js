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
            expect(item.children()[0].isExpanded()).toBe(false);
            expect(item.children()[0].isActive()).toBe(false);
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

        it("should page", function() {
            spyOn(page, "save").and.stub();

            item.addChild();

            expect(page.save).toHaveBeenCalled();
        });
    });

    describe("findChildByName", function() {

        it("should return child with given name", function() {
            var child = new Item({name: "child"});
            item.children.push(child);

            expect(item.findChildByName("child")).toBe(child);
        });
    });
});