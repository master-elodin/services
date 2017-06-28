describe("ActionList", function() {

    var actionList;

    beforeEach(function() {
        actionList = new ActionList({delayInMillis: 45000});
    });

    afterEach(function() {
        actionList = null;
    });

    describe("addAction", function() {

        it("should add action and sort based on serviceName", function() {
            var action1 = new Action({serviceName: "beta-service", hostIndexes: []});
            actionList.addAction(action1);

            expect(actionList.actions().length).toBe(1);
            expect(actionList.actions()[0]).toBe(action1);

            var action2 = new Action({serviceName: "alpha-service", hostIndexes: []});
            actionList.addAction(action2);

            expect(actionList.actions().length).toBe(2);
            expect(actionList.actions()[0]).toBe(action2);
            expect(actionList.actions()[1]).toBe(action1);
        });

        it("should merge existing action if one exists with the same serviceName", function() {
            var action1 = new Action({serviceName: "beta-service", hostIndexes: []});
            spyOn(action1, "merge").and.stub();
            actionList.addAction(action1);

            expect(actionList.actions().length).toBe(1);
            expect(actionList.actions()[0]).toBe(action1);

            var action2 = new Action({serviceName: "beta-service", hostIndexes: []});
            actionList.addAction(action2);

            expect(actionList.actions().length).toBe(1);
            expect(actionList.actions()[0]).toBe(action1);
            expect(action1.merge).toHaveBeenCalledWith(action2);
        });
    });
});