function ServiceInstance(creationData) {
    this.id = creationData.id;
    this.version = creationData.version;
    this.hostName = creationData.hostName;
    
    this.status = ko.observable(creationData.status);
}

ServiceInstance.prototype.compareTo = function(other) {
    var partsA = this.version.split(".");
    var partsB = other.version.split(".");
    for(var i = 0; i < partsA.length; i++) {
        var diff = parseInt(partsB[i]) - parseInt(partsA[i]);
        if(diff !== 0) {
            return diff;
        }
    }
    return 0;
}

ServiceInstance.Status = {
    RUNNING: {
        text: "Up",
        icon: "fa-check-circle-o",
        colorClass: "host-health__icon--running"
    },
    STOPPED: {
        text: "Stopped",
        icon: "fa-times-circle-o",
        colorClass: "host-health__icon--stopped"
    },
    STOPPING: {
        text: "Stopping" ,
        icon: "fa-times-circle-o",
        colorClass: "host-health__icon--stopping"
    },
    STARTING: {
        text: "Starting",
        icon: "fa-check-circle-o",
        colorClass: "host-health__icon--starting"
    },
    UNKNOWN: {
        text: "Unknown",
        icon: "fa-question-circle-o",
        colorClass: "host-health__icon--unknown"
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
    NONE: {
        text: "N/A",
        icon: "fa-question-circle-o",
        colorClass: "host-health__icon--unknown"
    }
};
