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

            var createActionList = function(name) {
                var actionList = new ActionList({delayInMillis: 1});
                actionList.addAction(new Action({serviceName: name, hostIndex: 0}));
                actionList.actions()[0].hostNames(["host1"]);
                actionRunner.actionLists.push(actionList);

                spyOn(actionList, "startCountdown").and.callFake(function() {
                    actionList.remainingDelay(0);
                    actionList.hasStarted(true);
                    return jQuery.Deferred().resolve();
                });
                return actionList;
            }

            actionList1 = createActionList("service1");
            actionList2 = createActionList("service2");

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

        it("should run next actionList after countdown complete", function(done) {
            activeServices()[0].addInstance(new ServiceInstance({status: ServiceInstance.Status.RUNNING, hostName: "host1"}));
            activeServices()[1].addInstance(new ServiceInstance({status: ServiceInstance.Status.RUNNING, hostName: "host1"}));
            actionRunner.run(activeServices).then(function() {
                expect(Data.runAction).toHaveBeenCalled();
                expect(Data.runAction.calls.count()).toBe(2);
                done();
            });
        });

        it("should not include service instance for host if service instance status is NONE", function(done) {
            actionList1.actions()[0].hostNames(["host1"]);
            activeServices()[0].addInstance(new ServiceInstance({status: ServiceInstance.Status.NONE, hostName: "host1"}));
            activeServices()[0].addInstance(new ServiceInstance({status: ServiceInstance.Status.RUNNING, hostName: "host1"}));

            actionRunner.run(activeServices).then(function() {
                expect(Data.runAction.calls.count()).toBe(1);
                done();
            });
        });
    });

    describe("pause", function() {

        var actionList;

        beforeEach(function() {
            actionList = new ActionList({delayInMillis: 1});
            spyOn(actionList, "pauseCountdown").and.stub();
            actionRunner.actionLists.push(actionList);
        });

        afterEach(function() {
            actionList = null;
        });

        it("should set isPaused=true", function() {
            actionRunner.isPaused(false);

            actionRunner.pause();

            expect(actionRunner.isPaused()).toBe(true);
        });

        it("should pause countdown", function() {
            actionRunner.pause();

            expect(actionList.pauseCountdown).toHaveBeenCalled();
        });
    });

    describe("currentActionList", function() {

        it("should return first action list that is not complete", function() {
            var actionList1 = new ActionList({});
            actionList1.remainingDelay(1);
            actionList1.hasStarted(true);
            actionRunner.actionLists.push(actionList1);

            var actionList2 = new ActionList({});
            actionList2.remainingDelay(1);
            actionList2.hasStarted(true);
            actionRunner.actionLists.push(actionList2);

            var actionList3 = new ActionList({});
            actionList3.remainingDelay(1);
            actionList3.hasStarted(true);
            actionRunner.actionLists.push(actionList3);

            expect(actionRunner.currentActionList()).toBe(actionList1);

            actionList1.remainingDelay(0);

            expect(actionRunner.currentActionList()).toBe(actionList2);
        });
    });
});