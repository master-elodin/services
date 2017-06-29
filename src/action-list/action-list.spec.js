describe("ActionList", function() {

    var actionList;
    var mockDeferred;

    beforeEach(function() {
        actionList = new ActionList({delayInMillis: 45000});
        mockDeferred = {resolve: function() {}, reject: function() {}};
        spyOn(mockDeferred, "resolve").and.stub();
        spyOn(mockDeferred, "reject").and.stub();
        spyOn(jQuery, "Deferred").and.returnValue(mockDeferred);
    });

    afterEach(function() {
        actionList = null;
        mockDeferred = null;
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

    describe("startCountdown", function() {

        beforeEach(function() {
            jasmine.clock().install();
        });

        afterEach(function() {
            jasmine.clock().uninstall();
        });

        // spying on window.clearInterval interferes with jasmine.clock()
        xit("should clear existing countdownInterval", function() {
            var countdownInterval = {};
            actionList.countdownInterval = countdownInterval;

            actionList.startCountdown();

            expect(window.clearInterval).toHaveBeenCalledWith(countdownInterval);
        });

        it("should decrement remainingDelay every second and resolve when 0 left", function() {
            actionList.remainingDelay(5);

            actionList.startCountdown();

            jasmine.clock().tick(1000);

            expect(actionList.remainingDelay()).toBe(4);
            expect(mockDeferred.resolve).not.toHaveBeenCalled();

            jasmine.clock().tick(4000);

            expect(actionList.remainingDelay()).toBe(0);
            expect(mockDeferred.resolve).toHaveBeenCalled();
        });
    });

    describe("pauseCountdown", function() {

        it("should clearInterval for countdown", function() {
            spyOn(window, "clearInterval").and.stub();
            var countdownInterval = {};
            actionList.countdownInterval = countdownInterval;

            actionList.pauseCountdown();

            expect(window.clearInterval).toHaveBeenCalledWith(countdownInterval);
        });

        it("should reject countdownComplete if not null", function() {
            actionList.countdownComplete = mockDeferred;

            actionList.pauseCountdown();

            expect(mockDeferred.reject).toHaveBeenCalled();
        });
    });
});