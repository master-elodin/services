describe("ActionListGroup", function() {

    var actionListGroup;

    beforeEach(function() {
        actionListGroup = new ActionListGroup();
    });

    afterEach(function() {
        actionListGroup = null;
    });

    describe("addActionList", function() {

        it("should add an action list in the order given", function() {
            expect(actionListGroup.actionLists().length).toBe(0);

            var actionList1 = new ActionList({delayInMillis: 0});
            actionListGroup.addActionList(actionList1);

            expect(actionListGroup.actionLists().length).toBe(1);
            expect(actionListGroup.actionLists()[0]).toBe(actionList1);

            var actionList2 = new ActionList({delayInMillis: 0});
            actionListGroup.addActionList(actionList2);

            expect(actionListGroup.actionLists().length).toBe(2);
            expect(actionListGroup.actionLists()[0]).toBe(actionList1);
            expect(actionListGroup.actionLists()[1]).toBe(actionList2);
        });
    });

    describe("getAllActions", function() {

        it("should return all actions", function() {
            var actionList1 = new ActionList({});
            actionList1.addAction(new Action({serviceName: "name1"}));
            actionList1.addAction(new Action({serviceName: "name2"}));
            actionListGroup.addActionList(actionList1);

            var actionList2 = new ActionList({});
            actionList2.addAction(new Action({serviceName: "name3"}));
            actionList2.addAction(new Action({serviceName: "name4"}));
            actionListGroup.addActionList(actionList2);

            expect(actionListGroup.getAllActions().length).toBe(4);
        });
    });

    describe("export", function() {

        it("should include name", function() {
            actionListGroup.name("action-list-name");

            expect(actionListGroup.export().name).toBe("action-list-name");
        });

        it("should include numTimesCompleted", function() {
            actionListGroup.numTimesCompleted = 42;

            expect(actionListGroup.export().numTimesCompleted).toBe(42);
        });

        it("should include action list", function() {
            var actionList = new ActionList({});
            var actionListExport = {};
            spyOn(actionList, "export").and.returnValue(actionListExport);
            actionListGroup.addActionList(actionList);

            var exportData = actionListGroup.export();

            expect(exportData.actionLists.length).toBe(1);
            expect(exportData.actionLists[0]).toBe(actionListExport);
        });
    });

    describe("import", function() {

        it("should set name", function() {
            actionListGroup.import({name: "name", actionLists: []});

            expect(actionListGroup.name()).toBe("name");
        });

        it("should set action lists", function() {
            var actionList = new ActionList({delayInMillis: 15});

            actionListGroup.import({actionLists: [actionList.export()]});

            expect(actionListGroup.actionLists().length).toBe(1);
            expect(actionListGroup.actionLists()[0].delayInMillis).toBe(15);
        });
    });
});