function ServiceController(creationData) {
    this.activeServices = creationData.activeServices;
    this.activeHostGroup = creationData.activeHostGroup;
    this.activeHostGroup.subscribe(function(newVal) {
        if(newVal) {
            var hostNames = newVal.getChildrenNames();
            this.activeActionListGroup().getAllActions().forEach(function(action) {
                action.hostNames(action.hostIndexes.map(function(hostIndex) {
                    return hostNames[hostIndex];
                }));
            });
        }
    }, this);

    this.activeActionListGroup = ko.observable(new ActionListGroup());

    this.startStopUnlocked = ko.observable(false);
    this.toggleStartStop = createToggle(this.startStopUnlocked);

    this.showLoadSave = ko.observable(false);
    this.toggleShowLoadSave = createToggle(this.showLoadSave);

    this.delayForNext = ko.observable(0);

    // TODO: load/save
    // TODO: import/export

    this.isRunning = ko.observable(false);
    this.currentRun = ko.observable();
    this.isPaused = ko.pureComputed(function() {
        return !!this.currentRun() && this.currentRun().isPaused();
    }, this);

    this.confirmationType = ko.observable();
    this.needsConfirmation = ko.pureComputed(function() {
        return !!this.confirmationType();
    }, this);

    this.disableAddClearButtons = ko.pureComputed(function() {
        return this.isRunning() || this.needsConfirmation() || this.isPaused() || this.showLoadSave();
    }, this);
};

ServiceController.DATA_NAME = "saved-configurations";

ServiceController.ConfirmationType = {
    START: {
        title: "Start",
        actionType: "start"
    },
    STOP: {
        title: "Stop",
        actionType: "stop"
    }
}

ServiceController.prototype.getActiveHosts = function() {
    return this.activeHostGroup() ? this.activeHostGroup().getChildrenNames() : [];
};

ServiceController.prototype.add = function(filterFunction) {
    var actionList = new ActionList({delayInMillis: this.delayForNext()});
    var activeHosts = this.getActiveHosts();
    this.activeServices().forEach(function(service) {
        service.getAllInstances().filter(filterFunction).forEach(function(serviceInstance) {
            actionList.addAction(new Action({serviceName: service.name, hostIndex: activeHosts.indexOf(serviceInstance.hostName)}));
        });
    });
    this.activeActionListGroup().addActionList(actionList);
};

ServiceController.prototype.addSelected = function() {
    this.add(function(serviceInstance) {
        return serviceInstance.selected();
    });
};

ServiceController.prototype.addAll = function() {
    this.add(function(serviceInstance) {
        return true;
    });
};

ServiceController.prototype.clear = function() {
    this.activeActionListGroup().actionLists([]);
};

ServiceController.prototype.pause = function() {
    this.currentRun().pause();
};

ServiceController.prototype.run = function() {
    var actionTypeChanged = true;
    if(this.currentRun()) {
        if(this.currentRun().actionType === this.confirmationType().actionType) {
            actionTypeChanged = false;
        } else {
            this.currentRun().pause();
        }
    }
    if(actionTypeChanged) {
        this.currentRun(new ActionRunner({
            actionLists: this.activeActionListGroup().actionLists,
            actionType: this.confirmationType().actionType,
            hostNameList: this.getActiveHosts()
        }));
    }
    this.currentRun().run(this.activeServices);
};

ServiceController.prototype.cancel = function() {
    this.confirmationType(null);
    this.currentRun(null);
};

ServiceController.prototype.start = function() {
    this.confirmationType(ServiceController.ConfirmationType.START);
};

ServiceController.prototype.stop = function() {
    this.confirmationType(ServiceController.ConfirmationType.STOP);
};