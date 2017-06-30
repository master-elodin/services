describe("ServiceController", function() {
    
    var activeHostGroup;
    var activeServices;
    var serviceController;

    // for testing purposes only
    Item.prototype.addChildWithName = function(name) {
        this.newChildName(name);
        this.addChild();
    }

    beforeEach(function() {
        activeHostGroup = ko.observable(new Item());
        activeServices = ko.observableArray();
        serviceController = new ServiceController({activeServices: activeServices, activeHostGroup: activeHostGroup});
        localStorage.removeItem(ServiceController.DATA_NAME);
    });

    afterEach(function() {
        activeHostGroup = null;
        activeServices = null;
        serviceController = null;
        localStorage.removeItem(ServiceController.DATA_NAME);
    });

    describe("getActiveHosts", function() {

        it("should return empty list if no activeHostGroup", function() {
            activeHostGroup(null);

            expect(serviceController.getActiveHosts().length).toBe(0);
        });

        it("should return host names if activeHostGroup", function() {
            activeHostGroup().addChildWithName("beta-host");
            activeHostGroup().addChildWithName("alpha-host");

            expect(serviceController.getActiveHosts().length).toBe(2);
            expect(serviceController.getActiveHosts()[0]).toBe("alpha-host");
            expect(serviceController.getActiveHosts()[1]).toBe("beta-host");
        });
    });

    describe("disableAddClearButtons", function() {

        it("should return false if not isRunning, isPaused, needing confirmation, or or showing load/save", function() {
            expect(serviceController.disableAddClearButtons()).toBe(false);
        });

        it("should return true if isRunning=true", function() {
            serviceController.isRunning(true);

            expect(serviceController.disableAddClearButtons()).toBe(true);
        });

        it("should return true if needsConfirmation=true", function() {
            serviceController.confirmationType(ServiceController.ConfirmationType.START);

            expect(serviceController.disableAddClearButtons()).toBe(true);
        });

        it("should return true if isPaused=true", function() {
            spyOn(serviceController, "isPaused").and.returnValue(true);

            expect(serviceController.disableAddClearButtons()).toBe(true);
        });

        it("should return true if showLoadSave=true", function() {
            serviceController.showLoadSave(true);

            expect(serviceController.disableAddClearButtons()).toBe(true);
        });
    });

    describe("addSelected", function() {

        var service1;
        var service2;

        var addServiceInstance = function(service, id, hostName) {
            var serviceInstance = new ServiceInstance({id: id, hostName: hostName});
            service.addInstance(serviceInstance);
            return serviceInstance;
        }

        beforeEach(function() {
            service1 = new Service({name: "service1"});
            activeServices.push(service1);
            addServiceInstance(service1, "service-instance1", "host1");
            addServiceInstance(service1, "service-instance2", "host2");
            service2 = new Service({name: "service2"});
            activeServices.push(service2);
            addServiceInstance(service2, "service-instance3", "host1");
            addServiceInstance(service2, "service-instance4", "host2");

            spyOn(serviceController, "getActiveHosts").and.returnValue(["host1", "host2"]);
        });

        afterEach(function() {
            service1 = null;
            service2 = null;
        });

        it("should add action based on host index if service instance is selected", function() {
            service1.getAllInstances()[1].selected(true);
            service2.getAllInstances()[0].selected(true);
            service2.getAllInstances()[1].selected(true);

            serviceController.addSelected();

            var actionList = serviceController.activeActionListGroup().actionLists()[0];
            expect(actionList.actions()[0].serviceName).toBe(service1.name);
            expect(actionList.actions()[0].hostIndexes.length).toBe(1);
            expect(actionList.actions()[0].hostIndexes[0]).toBe(1);

            expect(actionList.actions()[1].serviceName).toBe(service2.name);
            expect(actionList.actions()[1].hostIndexes.length).toBe(2);
            expect(actionList.actions()[1].hostIndexes[0]).toBe(0);
            expect(actionList.actions()[1].hostIndexes[1]).toBe(1);
        });

        it("should set delayInMillis", function() {
            serviceController.delayForNext(15);

            serviceController.addSelected();

            expect(serviceController.activeActionListGroup().actionLists()[0].delayInMillis).toBe(15);
            expect(serviceController.activeActionListGroup().actionLists()[0].remainingDelay()).toBe(15);
        });

        it("should call updateHostNamesForActions", function() {
            spyOn(serviceController, "updateHostNamesForActions").and.stub();

            serviceController.addSelected();

            expect(serviceController.updateHostNamesForActions).toHaveBeenCalled();
        });

        it("should set delayForNext to 0", function() {
            serviceController.delayForNext(60);

            serviceController.addSelected();

            expect(serviceController.delayForNext()).toBe(0);
        });

        it("should set selected=false for all services", function() {
            service1.getAllInstances()[1].selected(true);
            service2.getAllInstances()[0].selected(true);

            serviceController.addSelected();

            expect(service1.getAllInstances()[0].selected()).toBe(false);
            expect(service1.getAllInstances()[1].selected()).toBe(false);
        });
    });

    describe("addAll", function() {

        var service1;
        var service2;

        var addServiceInstance = function(service, id, hostName) {
            var serviceInstance = new ServiceInstance({id: id, hostName: hostName});
            service.addInstance(serviceInstance);
            return serviceInstance;
        }

        beforeEach(function() {
            service1 = new Service({name: "service1"});
            activeServices.push(service1);
            addServiceInstance(service1, "service-instance1", "host1");
            addServiceInstance(service1, "service-instance2", "host2");
            service2 = new Service({name: "service2"});
            activeServices.push(service2);
            addServiceInstance(service2, "service-instance3", "host1");
            addServiceInstance(service2, "service-instance4", "host2");

            spyOn(serviceController, "getActiveHosts").and.returnValue(["host1", "host2"]);
        });

        afterEach(function() {
            service1 = null;
            service2 = null;
        });

        it("should add action based on host index if service instance is selected", function() {
            service1.getAllInstances()[1].selected(true);
            service2.getAllInstances()[0].selected(true);
            service2.getAllInstances()[1].selected(true);

            serviceController.addAll();

            var actionList = serviceController.activeActionListGroup().actionLists()[0];
            expect(actionList.actions()[0].serviceName).toBe(service1.name);
            expect(actionList.actions()[0].hostIndexes.length).toBe(2);
            expect(actionList.actions()[0].hostIndexes[0]).toBe(0);
            expect(actionList.actions()[0].hostIndexes[1]).toBe(1);

            expect(actionList.actions()[1].serviceName).toBe(service2.name);
            expect(actionList.actions()[1].hostIndexes.length).toBe(2);
            expect(actionList.actions()[1].hostIndexes[0]).toBe(0);
            expect(actionList.actions()[1].hostIndexes[1]).toBe(1);
        });

        it("should set delayInMillis", function() {
            serviceController.delayForNext(15);

            serviceController.addSelected();

            expect(serviceController.activeActionListGroup().actionLists()[0].delayInMillis).toBe(15);
            expect(serviceController.activeActionListGroup().actionLists()[0].remainingDelay()).toBe(15);
        });
    });

    describe("clear", function() {

        it("should remove all action lists", function() {
            serviceController.activeActionListGroup().actionLists.push(new ActionList({}));

            expect(serviceController.activeActionListGroup().actionLists().length).toBe(1);

            serviceController.clear();

            expect(serviceController.activeActionListGroup().actionLists().length).toBe(0);
        });
    });

    describe("needsConfirmation", function() {

        it("should return true if confirmationType is not null", function() {
            serviceController.confirmationType(ServiceController.ConfirmationType.START);

            expect(serviceController.needsConfirmation()).toBe(true);

            serviceController.confirmationType(null);

            expect(serviceController.needsConfirmation()).toBe(false);

            serviceController.confirmationType(ServiceController.ConfirmationType.STOP);

            expect(serviceController.needsConfirmation()).toBe(true);
        });
    });

    describe("start", function() {

        it("should set confirmationType as START", function() {
            serviceController.start();

            expect(serviceController.confirmationType()).toBe(ServiceController.ConfirmationType.START);
        });
    });

    describe("stop", function() {

        it("should set confirmationType as STOP", function() {
            serviceController.stop();

            expect(serviceController.confirmationType()).toBe(ServiceController.ConfirmationType.STOP);
        });
    });

    describe("cancel", function() {

        it("should clear confirmationType and currentRun", function() {
            serviceController.confirmationType(ServiceController.ConfirmationType.START);
            serviceController.currentRun({});

            serviceController.cancel();

            expect(serviceController.confirmationType()).toBe(null);
            expect(serviceController.currentRun()).toBe(null);
        });
    });

    describe("run", function() {

        var actionRunner;

        beforeEach(function() {
            actionRunner = new ActionRunner({actionType: ServiceController.ConfirmationType.START.actionType});
            spyOn(actionRunner, "run").and.returnValue(jQuery.Deferred().resolve());
            spyOn(actionRunner, "pause").and.stub();
            serviceController.currentRun(actionRunner);
        });

        afterEach(function() {
            actionRunner = null;
        });

        it("should create new currentRun with START if START and no currentRun", function() {
            serviceController.currentRun(null);
            serviceController.confirmationType(ServiceController.ConfirmationType.START);

            serviceController.run();

            expect(serviceController.currentRun().actionType).toBe(ServiceController.ConfirmationType.START.actionType);
            expect(serviceController.currentRun().actionLists).toBe(serviceController.activeActionListGroup().actionLists);
        });

        it("should call run on currentRun if START, currentRun exists, and currentRun is START", function() {
            serviceController.confirmationType(ServiceController.ConfirmationType.START);

            serviceController.run();

            expect(actionRunner.run).toHaveBeenCalled();
        });

        it("should create new currentRun and call stop on existing currentRun if START, currentRun exists, and currentRun is STOP", function() {
            actionRunner.actionType = ServiceController.ConfirmationType.STOP;
            serviceController.confirmationType(ServiceController.ConfirmationType.START);

            serviceController.run();

            expect(actionRunner.pause).toHaveBeenCalled();
            expect(serviceController.currentRun().actionType).toBe(ServiceController.ConfirmationType.START.actionType);
        });

        // TODO: would need a deferred in the run() method
        xit("should clear confirmationType", function() {
            serviceController.confirmationType(ServiceController.ConfirmationType.START);

            serviceController.run();

            expect(serviceController.confirmationType()).toBe(null);
        });
    });

    describe("pause", function() {

        it("should call pause on currentRun", function() {
            var actionRunner = new ActionRunner({actionType: ServiceController.ConfirmationType.STOP.actionType});
            spyOn(actionRunner, "pause").and.stub();
            serviceController.currentRun(actionRunner);

            serviceController.pause();

            expect(actionRunner.pause).toHaveBeenCalled();
        });
    });

    describe("isPaused", function() {

        it("should return true if currentRun is not null and currentRun.isPaused=true", function() {
            var actionRunner = new ActionRunner({actionType: ServiceController.ConfirmationType.STOP.actionType});
            serviceController.currentRun(actionRunner);
            spyOn(actionRunner, "isPaused").and.returnValue(true);

            expect(serviceController.isPaused()).toBe(true);
        });

        it("should return false if currentRun is not null and currentRun.isPaused=false", function() {
            var actionRunner = new ActionRunner({actionType: ServiceController.ConfirmationType.STOP.actionType});
            serviceController.currentRun(actionRunner);
            spyOn(actionRunner, "isPaused").and.returnValue(false);

            expect(serviceController.isPaused()).toBe(false);
        });

        it("should return false if currentRun is null", function() {
            serviceController.currentRun(null);

            expect(serviceController.isPaused()).toBe(false);
        });
    });

    describe("activeHostGroup", function() {

        it("should update hostNames for all actions when activeHostGroup changes", function() {
            var action = new Action({});
            action.hostIndexes = [1, 2];
            var actionList = new ActionList({});
            actionList.addAction(action);
            serviceController.activeActionListGroup().addActionList(actionList);

            var newActiveHostGroup = new Item();
            newActiveHostGroup.addChildWithName("host1");
            newActiveHostGroup.addChildWithName("host2");
            newActiveHostGroup.addChildWithName("host3");

            serviceController.activeHostGroup(newActiveHostGroup);

            expect(serviceController.activeActionListGroup().actionLists()[0].actions()[0].hostNames().length).toBe(2);
            expect(serviceController.activeActionListGroup().actionLists()[0].actions()[0].hostNames()[0]).toBe("host2");
            expect(serviceController.activeActionListGroup().actionLists()[0].actions()[0].hostNames()[1]).toBe("host3");
        });
    });

    describe("getSavedData", function() {

        it("should return new saved data if not found", function() {
            expect(serviceController.getSavedData().savedConfigurations.length).toBe(0);
        });

        it("should return saved data if found", function() {
            localStorage.setItem(ServiceController.DATA_NAME, JSON.stringify({activeListGroupName: "group1", savedConfigurations: [{name: "group1"}, {name: "group2"}]}));

            var savedData = serviceController.getSavedData();

            expect(savedData.savedConfigurations.length).toBe(2);
            expect(savedData.savedConfigurations[0].name).toBe("group1");
            expect(savedData.savedConfigurations[1].name).toBe("group2");
            expect(savedData.activeListGroupName).toBe("group1");
        });
    });

    describe("save", function() {

        it("should add activeActionListGroup if does not already exist", function() {
            localStorage.setItem(ServiceController.DATA_NAME, JSON.stringify({activeListGroupName: "group1", savedConfigurations: [{name: "group1"}]}));
            serviceController.activeActionListGroup().name("group2");

            serviceController.save();

            var savedData = serviceController.getSavedData();
            expect(savedData.savedConfigurations.length).toBe(2);
            expect(savedData.savedConfigurations[0].name).toBe("group1");
            expect(savedData.savedConfigurations[1].name).toBe("group2");
            expect(savedData.activeListGroupName).toBe("group2");
        });

        it("should overwrite existing actionListGroup if already exists", function() {
            localStorage.setItem(ServiceController.DATA_NAME, JSON.stringify({activeListGroupName: "group1", savedConfigurations: [{name: "group1"}, {name: "group2"}]}));
            serviceController.activeActionListGroup().name("group2");

            serviceController.save();

            var savedData = serviceController.getSavedData();
            expect(savedData.savedConfigurations.length).toBe(2);
            expect(savedData.savedConfigurations[0].name).toBe("group1");
            expect(savedData.savedConfigurations[1].name).toBe("group2");
            expect(savedData.activeListGroupName).toBe("group2");
        });

        it("should add to savedConfigurations if it does not already exist", function() {
            serviceController.save();

            expect(serviceController.savedConfigurations()[0]).toBe(serviceController.activeActionListGroup());
        });
    });

    describe("load", function() {

        it("should set activeListGroup", function() {
            var actionListGroup1 = new ActionListGroup({name: "actionListGroup1", actionLists: []});
            var actionListGroup2 = new ActionListGroup({name: "actionListGroup2", actionLists: []});
            serviceController.savedConfigurations([actionListGroup1, actionListGroup2]);

            serviceController.load(actionListGroup2);

            expect(serviceController.activeActionListGroup()).toBe(actionListGroup2);
        });
    });
});