function ServiceInstance(creationData) {
    this.id = creationData.id;
    this.version = creationData.version;
    this.hostName = creationData.hostName;

    this.idWithoutStatus = creationData.id.substring(0, creationData.id.lastIndexOf(";"));

    this.status = ko.observable(creationData.status || ServiceInstance.Status.UNKNOWN);
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
        colorClass: "host-health__icon--running",
        sortIndex: 0
    },
    STARTING: {
        text: "Starting",
        icon: "fa-check-circle-o",
        colorClass: "host-health__icon--starting",
        sortIndex: 1
    },
    STOPPING: {
        text: "Stopping" ,
        icon: "fa-times-circle-o",
        colorClass: "host-health__icon--stopping",
        sortIndex: 1
    },
    STOPPED: {
        text: "Stopped",
        icon: "fa-times-circle-o",
        colorClass: "host-health__icon--stopped",
        sortIndex: 1
    },
    START_FAILED: {
        text: "Start Failed",
        icon: "fa-exclamation-circle",
        colorClass: "host-health__icon--failed",
        sortIndex: 1
    },
    RESTART_FAILED: {
        text: "Restart Failed",
        icon: "fa-exclamation-circle",
        colorClass: "host-health__icon--failed",
        sortIndex: 1
    },
    DOWN: {
        text: "Down",
        icon: "fa-exclamation-circle",
        colorClass: "host-health__icon--down",
        sortIndex: 1
    },
    UNKNOWN: {
        text: "Unknown",
        icon: "fa-question-circle-o",
        colorClass: "host-health__icon--unknown",
        sortIndex: 2
    },
    NONE: {
        text: "N/A",
        icon: "fa-question-circle-o",
        colorClass: "host-health__icon--unknown",
        sortIndex: 3
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
    var statusDiff = this.status().sortIndex - other.status().sortIndex;
    if(statusDiff === 0) {
        if(this.status() !== ServiceInstance.Status.NONE && other.status() !== ServiceInstance.Status.NONE) {
            var partsA = this.version.split(".");
            var partsB = other.version.split(".");
            for(var i = 0; i < partsA.length; i++) {
                var diff = parseInt(partsB[i]) - parseInt(partsA[i]);
                if(diff !== 0) {
                    statusDiff = diff;
                    break;
                }
            }
        } else if(this.status() === ServiceInstance.Status.NONE && other.status() !== ServiceInstance.Status.NONE) {
            statusDiff = 1;
        } else if(this.status() !== ServiceInstance.Status.NONE && other.status() === ServiceInstance.Status.NONE) {
            statusDiff = -1;
        }
    }
    return statusDiff;
}

ServiceInstance.prototype.run = function(confirmationType) {
    var successText = confirmationType.title + " successful for " + this.version + " on " + this.hostName;
    Data.runAction({id: this.id, actionType: confirmationType.actionType}).then(function(success){
        page.pageMessage(new Message({text: successText, type: Message.Type.SUCCESS}));
    }).fail(function(error) {
        page.pageMessage(new Message({text: error.error, type: Message.Type.ERROR}));
    });
}

ServiceInstance.prototype.start = function() {
    this.run(ServiceController.ConfirmationType.START);
};

ServiceInstance.prototype.stop = function() {
    this.run(ServiceController.ConfirmationType.STOP);
};

ServiceInstance.prototype.restart = function() {
    this.run(ServiceController.ConfirmationType.RESTART);
};
