function ServiceController(creationData) {
    this.activeServices = creationData.activeServices;
    this.activeHostGroup = creationData.activeHostGroup;
    this.activeHostGroup.subscribe(this.updateHostNamesForActions.bind(this));

    this.activeActionListGroup = ko.observable(new ActionListGroup());
    this.activeActionListGroup.subscribe(this.updateHostNamesForActions.bind(this));

    this.startStopUnlocked = ko.observable(false);
    this.toggleStartStop = createToggle(this.startStopUnlocked);

    this.showLoadSave = ko.observable(false);
    this.toggleShowLoadSave = createToggle(this.showLoadSave);

    this.delayForNext = ko.observable(0);

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

    this.configurationName = ko.observable();
    this.savedConfigurations = ko.observableArray();

    this.loadSavedData();
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
    },
    RESTART: {
        title: "Restart",
        actionType: "stopAndRestart"
    }
}

ServiceController.prototype.updateHostNamesForActions = function() {
    if(this.activeHostGroup()) {
        var hostNames = this.activeHostGroup().getChildrenNames();
        this.activeActionListGroup().getAllActions().forEach(function(action) {
            action.hostNames(action.hostIndexes.map(function(hostIndex) {
                return hostNames[hostIndex];
            }));
        });
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
            serviceInstance.selected(false);
        });
    });
    this.activeActionListGroup().addActionList(actionList);
    this.updateHostNamesForActions();
    this.delayForNext(0);
    this.activeActionListGroup().name("");
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
    this.activeActionListGroup().name("");
};

ServiceController.prototype.pause = function() {
    this.currentRun().pause();
};

ServiceController.prototype.resetCurrentRun = function() {
    this.activeActionListGroup().actionLists().forEach(function(actionList) {
        actionList.remainingDelay(actionList.delayInMillis);
        actionList.hasStarted(false);
    });
    this.currentRun(new ActionRunner({
        actionLists: this.activeActionListGroup().actionLists,
        actionType: this.confirmationType().actionType,
        hostNameList: this.getActiveHosts()
    }));
}

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
        this.resetCurrentRun();
    }
    var instance = this;
    this.isRunning(true);
    this.currentRun().run(this.activeServices).then(function() {
        instance.isRunning(false);
        instance.confirmationType(null);
    }).fail(function(error) {
        page.pageMessage(new Message({text: error.error, type: Message.Type.ERROR}));
        instance.resetCurrentRun();
    });
};

ServiceController.prototype.cancel = function() {
    this.resetCurrentRun();
    this.confirmationType(null);
    this.currentRun(null);
    this.isRunning(false);
};

ServiceController.prototype.start = function() {
    this.confirmationType(ServiceController.ConfirmationType.START);
};

ServiceController.prototype.stop = function() {
    this.confirmationType(ServiceController.ConfirmationType.STOP);
};

ServiceController.prototype.loadSavedData = function(savedData) {
    savedData = savedData || this.getSavedData();
    console.log("Loading run configuration", savedData);
    var instance = this;
    savedData.savedConfigurations.forEach(function(savedConfig) {
        var actionListGroup = new ActionListGroup(savedConfig);
        instance.savedConfigurations.push(actionListGroup);
        if(actionListGroup.name() === savedData.activeListGroupName) {
            instance.activeActionListGroup(actionListGroup.duplicate());
        }
    });
};

ServiceController.prototype.getSavedData = function() {
    var savedData = localStorage.getItem(ServiceController.DATA_NAME);
    if(savedData) {
        savedData = JSON.parse(savedData);
    }
    if(!savedData || !savedData.savedConfigurations) {
        savedData = {savedConfigurations: [], activeListGroupName: null};
    }
    console.log("Saved data", savedData);
    return savedData;
};

ServiceController.prototype.load = function(actionListGroup) {
    this.activeActionListGroup(actionListGroup);
    this.showLoadSave(false);
};

ServiceController.prototype.save = function() {
    var saveData = {
        activeListGroupName: this.activeActionListGroup().name(),
        savedConfigurations: this.savedConfigurations().map(function(configuration) {
            return configuration.export();
        })
    };
    // don't save active action list group if it doesn't have a name
    if(this.activeActionListGroup().name()) {
        var actionActionListGroupData = this.activeActionListGroup().export();
        var existingActionListGroup = saveData.savedConfigurations.find(function(actionListGroup) {
            return actionListGroup.name === actionActionListGroupData.name;
        });
        if(existingActionListGroup) {
            saveData.savedConfigurations.splice(saveData.savedConfigurations.indexOf(existingActionListGroup), 1, actionActionListGroupData);
        } else {
            saveData.savedConfigurations.push(actionActionListGroupData);
            // copy active into a new ActionListGroup
            this.savedConfigurations.push(this.activeActionListGroup().duplicate());
        }
    }
    localStorage.setItem(ServiceController.DATA_NAME, JSON.stringify(saveData));
};

ServiceController.prototype.downloadSingleConfig = function(actionListGroup) {
    downloadAsFile(JSON.stringify(actionListGroup.export()), "action-list-" + removeWhitespace(actionListGroup.name()));
};

ServiceController.prototype.downloadAllServiceConfig = function() {
    downloadAsFile(JSON.stringify(this.getSavedData()), ServiceController.DATA_NAME);
};

ServiceController.prototype.uploadConfig = function() {
    var instance = this;
    uploadFile(function(configText) {
        var config = JSON.parse(configText);
        if(config.savedConfigurations) {
            // multi-config
            instance.loadSavedData(config);
        } else {
            instance.loadSavedData({savedConfigurations: [config], activeListGroupName: null});
        }
        instance.save();
    });
};

ServiceController.prototype.removeConfiguration = function(configuration) {
    if(this.activeActionListGroup() && this.activeActionListGroup().name() === configuration.name()) {
        this.activeActionListGroup().name("");
    }
    this.savedConfigurations().remove(configuration);
    this.save();
    this.savedConfigurations.valueHasMutated();
}