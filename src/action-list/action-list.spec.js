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

        it("should set hasStarted=true", function() {
            actionList.startCountdown();

            expect(actionList.hasStarted()).toBe(true);
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

        it("should reject countdownDeferred if not null", function() {
            actionList.countdownDeferred = mockDeferred;

            actionList.pauseCountdown();

            expect(mockDeferred.reject).toHaveBeenCalled();
        });
    });

    describe("isComplete", function() {

        it("should return false if remainingDelay is not 0", function() {
            actionList.remainingDelay(10);

            expect(actionList.isComplete()).toBe(false);
        });

        it("should return false if hasStarted is false", function() {
            actionList.hasStarted(false);

            expect(actionList.isComplete()).toBe(false);
        });

        it("should return true if hasStarted is true and remainingDelay is 0", function() {
            actionList.hasStarted(true);
            actionList.remainingDelay(0);

            expect(actionList.isComplete()).toBe(true);
        });
    });

    describe("export", function() {

        it("should include delayInMillis", function() {
            actionList.delayInMillis = 15;

            expect(actionList.export().delayInMillis).toBe(15);
        });

        it("should include actions", function() {
            var createAction = function(name) {
                var action = new Action({serviceName: name, hostIndexes: []});
                var actionExport = {};
                spyOn(action, "export").and.returnValue(actionExport);
                actionList.addAction(action);
                return action;
            }
            var action1 = createAction("service1");
            var action2 = createAction("service2");

            expect(actionList.export().actions.length).toBe(2);
            expect(actionList.export().actions[0]).toBe(action1.export());
            expect(actionList.export().actions[1]).toBe(action2.export());
        });
    });

    describe("import", function() {

        it("should set delayInMillis and remainingDelay", function() {
            actionList.import({
                delayInMillis: 42,
                actions: []
            });

            expect(actionList.delayInMillis).toBe(42);
            expect(actionList.remainingDelay()).toBe(42);
        });

        it("should set actions", function() {
            var action1 = new Action({serviceName: "service1"});
            var action2 = new Action({serviceName: "service2"});
            actionList.import({
                delayInMillis: 0,
                actions: [action1.export(), action2.export()]
            });

            expect(actionList.actions().length).toBe(2);
            expect(actionList.actions()[0].serviceName).toBe("service1");
            expect(actionList.actions()[1].serviceName).toBe("service2");
        });
    });
});