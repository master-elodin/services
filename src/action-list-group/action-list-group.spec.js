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
});