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
    RUNNING: "Up",
    STOPPED: "Stopped",
    STOPPING: "Stopping",
    STARTING: "Starting",
    UNKNOWN: "Unknown",
    START_FAILED: "Start Failed",
    DOWN: "Down",
    NONE: "N/A"
};