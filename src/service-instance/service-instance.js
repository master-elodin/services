function ServiceInstance(creationData) {
    this.id = creationData.id;
    this.version = creationData.version;
    this.hostName = creationData.hostName;

    this.idWithoutStatus = creationData.id.substring(0, creationData.id.lastIndexOf(";"));

    this.status = ko.observable(creationData.status || ServiceInstance.Status.UNKNOWN);
    this.isLoadingData = ko.observable(false);
    this.detailedData = ko.observable(new ServiceInstanceDetails({hostName: this.hostName, version: this.version, status: this.status().text}));
    this.isRunning = ko.pureComputed(function() {
        return this.status() === ServiceInstance.Status.RUNNING;
    }, this);
    this.isReal = ko.pureComputed(function() {
        return this.status() !== ServiceInstance.Status.NONE;
    }, this);

    // for start/stop
    this.selected = ko.observable(false);
    this.toggleSelected = createToggle(this.selected);

    // know which is parent to be able to re-sort when actions are taken
    this.parent = null;

    /* Not running, stopping, starting, etc */
    this.isActive = ko.pureComputed(function() {
        return ServiceInstance.NON_RUNNING_STATUSES.indexOf(this.status()) === -1;
    }, this);

    this.isChanging = ko.pureComputed(function() {
        return this.status() === ServiceInstance.Status.STARTING || this.status() === ServiceInstance.Status.STOPPING;
    }, this);
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
        sortIndex: 2
    },
    STOPPED: {
        text: "Stopped",
        icon: "fa-times-circle-o",
        colorClass: "host-health__icon--stopped",
        sortIndex: 2
    },
    START_FAILED: {
        text: "Start Failed",
        icon: "fa-exclamation-circle",
        colorClass: "host-health__icon--failed",
        sortIndex: 2
    },
    RESTART_FAILED: {
        text: "Restart Failed",
        icon: "fa-exclamation-circle",
        colorClass: "host-health__icon--failed",
        sortIndex: 2
    },
    DOWN: {
        text: "Down",
        icon: "fa-exclamation-circle",
        colorClass: "host-health__icon--down",
        sortIndex: 2
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
        sortIndex: 4
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

ServiceInstance.NON_RUNNING_STATUSES = [
    ServiceInstance.Status.STOPPED,
    ServiceInstance.Status.DOWN,
    ServiceInstance.Status.UNKNOWN,
    ServiceInstance.Status.NONE,
    ServiceInstance.Status.START_FAILED,
    ServiceInstance.Status.RESTART_FAILED
];

ServiceInstance.prototype.getStatusChangingClass = function() {
    if(this.status() === ServiceInstance.Status.STARTING) {
        return "service-actions__changing-indicator--starting";
    } else if(this.status() === ServiceInstance.Status.STOPPING) {
        return "service-actions__changing-indicator--stopping";
    } else {
        return "";
    }
}

ServiceInstance.prototype.compareTo = function(other) {
    var statusDiff = this.status().sortIndex - other.status().sortIndex;
    if(statusDiff === 0) {
        if(this.status() !== ServiceInstance.Status.NONE && other.status() !== ServiceInstance.Status.NONE) {
            var partsA = this.version.split(".");
            var partsB = other.version.split(".");
            for(var i = 0; i < partsA.length; i++) {
                // sort in descending order based on version
                // if return value is a negative number, A comes first in the list
                // so if A is a greater number than B, diff will be negative so A will come first
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
    var instance = this;
    Data.runAction({id: this.id, actionType: confirmationType.actionType}).then(function(data) {
        instance.updateDetailedData(data);
        instance.status(ServiceInstance.Status.getForText(data.status));
        instance.parent.sortInstances();
        var successText = confirmationType.title + " successful for " + instance.version + " on " + instance.hostName;
        page.pageMessage(new Message({text: successText, type: Message.Type.SUCCESS}));
    }).fail(function(error) {
        console.log("Failed running service instance!", error);
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

ServiceInstance.prototype.updateDetailedData = function(data) {
    this.detailedData(data);
    this.isLoadingData(false);
};

ServiceInstance.prototype.loadInfo = function() {
    this.isLoadingData(true);
    Data.getServiceInstanceData(this.id).then(this.updateDetailedData.bind(this));
};
