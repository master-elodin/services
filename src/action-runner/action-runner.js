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
    this.runComplete = null;
}

ActionRunner.prototype.run = function(activeServices) {
    this.isPaused(false);
    this.runComplete = jQuery.Deferred();

    var instance = this;
    var runActionList = function() {
        var actionList = instance.currentActionList();
        if(actionList) {
            actionList.startCountdown().then(function() {
                actionList.actions().forEach(function(action) {
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
            instance.runComplete.resolve();
        }
    }
    runActionList();
    return this.runComplete;
};

ActionRunner.prototype.pause = function() {
    this.isPaused(true);
};