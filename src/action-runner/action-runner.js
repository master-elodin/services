function ActionRunner(creationData) {
    this.actionType = creationData.actionType;
    this.hostNameList = creationData.hostNameList;

    this.actionLists = creationData.actionLists;
    this.currentActionList = ko.pureComputed(function() {
        return this.actionLists().find(function(actionList) {
            return !actionList.isComplete();
        });
    }, this);

    this.isPaused = ko.observable(false);
}

ActionRunner.prototype.run = function(activeServices) {
    console.log("Running actions!");
    this.isPaused(false);
    var runComplete = jQuery.Deferred();

    var instance = this;
    var runActionList = function() {
        var actionList = instance.currentActionList();
        if(actionList) {
            console.log("Running actions", actionList);
            actionList.startCountdown().then(function() {
                actionList.actions().forEach(function(action) {
                    console.log("Running action", action);
                    var service = activeServices().find(function(service) {
                        return service.name === action.serviceName;
                    });
                    // each action has a service name and a list of host indexes
                    action.hostNames().forEach(function(hostName) {
                        var serviceInstance = service.getFirstInstanceForHost(hostName);
                        if(serviceInstance.status() !== ServiceInstance.Status.NONE) {
                            Data.runAction({
                                actionType: instance.actionType,
                                id: serviceInstance.id
                            });
                        }
                    });
                });
                runActionList();
            });
        } else {
            console.log("Action runs complete!");
            runComplete.resolve();
        }
    }
    runActionList();
    return  runComplete;
};

ActionRunner.prototype.pause = function() {
    console.log("Pausing actions...");
    this.isPaused(true);
    this.currentActionList().pauseCountdown();
};