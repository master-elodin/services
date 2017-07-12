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

    var runActionForHost = function(action, service, hostNameIndex, actionForHostComplete) {
        var hostName = action.hostNames()[hostNameIndex];
        if(hostName) {
            var serviceInstance = service.getFirstInstanceForHost(hostName);
            if(serviceInstance.status() !== ServiceInstance.Status.NONE) {
                Data.runAction({
                    actionType: instance.actionType,
                    id: serviceInstance.id
                }).then(function() {
                    runActionForHost(action, service, hostNameIndex + 1, actionForHostComplete);
                }).fail(function(error) {
                    actionForHostComplete.reject(error);
                });
            } else {
                runActionForHost(action, service, hostNameIndex + 1, actionForHostComplete);
            }
        } else {
            actionForHostComplete.resolve();
        }
    };

    var runAction = function(actionList, actionIndex, actionComplete) {
        var action = actionList.actions()[actionIndex];
        if(action) {
            console.log("Running action", action);
            var service = activeServices().find(function(service) {
                return service.name === action.serviceName;
            });
            // each action has a service name and a list of host indexes
            var actionForHostComplete = jQuery.Deferred();
            runActionForHost(action, service, 0, actionForHostComplete);
            actionForHostComplete.then(function() {
                runAction(actionList, actionIndex + 1, actionComplete);
            }).fail(function(error) {
                actionComplete.reject(error);
            });
        } else {
            actionComplete.resolve();
        }
    }

    var runActionList = function() {
        var actionList = instance.currentActionList();
        if(actionList) {
            console.log("Running actions", actionList);
            actionList.startCountdown().then(function() {
                var actionComplete = jQuery.Deferred();
                runAction(actionList, 0, actionComplete);
                actionComplete.then(function() {
                    runActionList();
                }).fail(function(error) {
                    runComplete.reject(error);
                });
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