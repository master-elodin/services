describe("ActionRunner", function() {

    var actionRunner;

    beforeEach(function() {
        actionRunner = new ActionRunner({actionLists: ko.observableArray(), hostNameList: ["host1", "host2"]});
    });

    afterEach(function() {
        actionRunner = null;
    });

    describe("run", function() {

        var actionList1;
        var actionList2;
        var activeServices;

        beforeEach(function() {
            spyOn(Data, "runAction").and.stub();

            actionList1 = new ActionList({delayInMillis: 1});
            actionList1.addAction(new Action({serviceName: "service1", hostIndex: 0}));
            actionRunner.actionLists.push(actionList1);

            actionList2 = new ActionList({delayInMillis: 1});
            actionList2.addAction(new Action({serviceName: "service2", hostIndex: 0}));
            actionRunner.actionLists.push(actionList2);

            var service1 = new Service({name: "service1"});
            var service2 = new Service({name: "service2"});
            activeServices = ko.observableArray([service1, service2]);
        });

        afterEach(function() {
            actionList1 = null;
            actionList2 = null;
            activeServices = null;
        });

        it("should set isPaused=false", function() {
            actionRunner.isPaused(true);

            actionRunner.run(activeServices);

            expect(actionRunner.isPaused()).toBe(false);
        });

        it("should call Data.runAction after countdown complete", function(done) {
            spyOn(actionList1, "startCountdown").and.callFake(function() {
                actionList1.remainingDelay(0);
                return jQuery.Deferred().resolve();
            });

            var runComplete = actionRunner.run(activeServices);

            runComplete.then(function() {
                expect(Data.runAction).toHaveBeenCalled();
                done();
            });
        });

        it("should run next actionList after countdown complete", function(done) {
            spyOn(actionList1, "startCountdown").and.callFake(function() {
                actionList1.remainingDelay(0);
                return jQuery.Deferred().resolve();
            });
            spyOn(actionList2, "startCountdown").and.callFake(function() {
                actionList2.remainingDelay(0);
                return jQuery.Deferred().resolve();
            });

            var runComplete = actionRunner.run(activeServices);

            runComplete.then(function() {
                expect(Data.runAction).toHaveBeenCalled();
                expect(Data.runAction.calls.count()).toBe(2);
                done();
            });
        });
    });

    describe("pause", function() {

        it("should set isPaused=true", function() {
            actionRunner.isPaused(false);

            actionRunner.pause();

            expect(actionRunner.isPaused()).toBe(true);
        });
    });

    describe("currentActionList", function() {

        it("should return first action list that is not complete", function() {
            var actionList1 = new ActionList({});
            actionList1.remainingDelay(1);
            actionRunner.actionLists.push(actionList1);

            var actionList2 = new ActionList({});
            actionList2.remainingDelay(1);
            actionRunner.actionLists.push(actionList2);

            var actionList3 = new ActionList({});
            actionList3.remainingDelay(1);
            actionRunner.actionLists.push(actionList3);

            expect(actionRunner.currentActionList()).toBe(actionList1);

            actionList1.remainingDelay(0);

            expect(actionRunner.currentActionList()).toBe(actionList2);
        });
    });
});