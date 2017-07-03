function ServiceInstance(creationData) {
    this.id = creationData.id;
    this.version = creationData.version;
    this.hostName = creationData.hostName;

    this.status = ko.observable(creationData.status);
    this.isRunning = ko.pureComputed(function() {
        return this.status() === ServiceInstance.Status.RUNNING;
    }, this);
    this.isReal = ko.pureComputed(function() {
        return this.status() !== ServiceInstance.Status.NONE;
    }, this);

    // for start/stop
    this.selected = ko.observable(false);
    this.toggleSelected = createToggle(this.selected);
}

ServiceInstance.Status = {
    RUNNING: {
        text: "Up",
        icon: "fa-check-circle-o",
        colorClass: "host-health__icon--running"
    },
    STARTING: {
        text: "Starting",
        icon: "fa-check-circle-o",
        colorClass: "host-health__icon--starting"
    },
    STOPPING: {
        text: "Stopping" ,
        icon: "fa-times-circle-o",
        colorClass: "host-health__icon--stopping"
    },
    STOPPED: {
        text: "Stopped",
        icon: "fa-times-circle-o",
        colorClass: "host-health__icon--stopped"
    },
    START_FAILED: {
        text: "Start Failed",
        icon: "fa-exclamation-circle",
        colorClass: "host-health__icon--failed"
    },
    RESTART_FAILED: {
        text: "Restart Failed",
        icon: "fa-exclamation-circle",
        colorClass: "host-health__icon--failed"
    },
    DOWN: {
        text: "Down",
        icon: "fa-exclamation-circle",
        colorClass: "host-health__icon--down"
    },
    UNKNOWN: {
        text: "Unknown",
        icon: "fa-question-circle-o",
        colorClass: "host-health__icon--unknown"
    },
    NONE: {
        text: "N/A",
        icon: "fa-question-circle-o",
        colorClass: "host-health__icon--unknown"
    },
    getForText: function(statusText) {
        var foundStatus = this.UNKNOWN;
        Object.keys(this).forEach(function(statusKey) {
            if(this[statusKey].text === statusText) {
                foundStatus = this[statusKey];
                return false;
            }
        }, this);
        return foundStatus;
    }
};

ServiceInstance.prototype.compareTo = function(other) {
    if(this.status() !== ServiceInstance.Status.NONE && other.status() !== ServiceInstance.Status.NONE) {
        var partsA = this.version.split(".");
        var partsB = other.version.split(".");
        for(var i = 0; i < partsA.length; i++) {
            var diff = parseInt(partsB[i]) - parseInt(partsA[i]);
            if(diff !== 0) {
                return diff;
            }
        }
    } else if(this.status() === ServiceInstance.Status.NONE && other.status() !== ServiceInstance.Status.NONE) {
        return 1;
    } else if(this.status() !== ServiceInstance.Status.NONE && other.status() === ServiceInstance.Status.NONE) {
        return -1;
    }
    return 0;
}

ServiceInstance.prototype.start = function() {
    Data.runAction({id: this.id, actionType: ServiceController.ConfirmationType.START.actionType});
};

ServiceInstance.prototype.stop = function() {
    Data.runAction({id: this.id, actionType: ServiceController.ConfirmationType.STOP.actionType});
};

ServiceInstance.prototype.restart = function() {
    Data.runAction({id: this.id, actionType: ServiceController.ConfirmationType.RESTART.actionType});
};
