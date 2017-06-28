describe("Action", function() {

    var action;

    beforeEach(function() {
        action = new Action({serviceName: "service", hostIndex: 0});
    });

    afterEach(function() {
        action = null;
    });

    describe("merge", function() {

        it("should add host index in order if it doesn't already exist", function() {
            var otherAction = new Action({serviceName: "service", hostIndex: 2});
            otherAction.hostIndexes([0, 3, 2]);

            action.merge(otherAction);

            expect(action.hostIndexes().length).toBe(3);
            expect(action.hostIndexes()[0]).toBe(0);
            expect(action.hostIndexes()[1]).toBe(2);
            expect(action.hostIndexes()[2]).toBe(3);
        });
    });
});