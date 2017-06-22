function ServiceInstance(loadingData) {
    var instance = this;

    instance.id = ko.observable(loadingData.id);
    instance.version = ko.observable(loadingData.version);
    
    instance.status = ko.observable(loadingData.status || ServiceInstance.Status.UNKNOWN);

    instance.isRunning = ko.pureComputed(function() {
        return instance.status() === ServiceInstance.Status.RUNNING;
    });

    instance.isStopped = ko.pureComputed(function() {
        return instance.status() === ServiceInstance.Status.STOPPED;
    });

    instance.hasNoStatus = ko.pureComputed(function() {
        return instance.status() === ServiceInstance.Status.UNKNOWN || instance.status() === ServiceInstance.Status.NONE;
    });

    instance.isReal = ko.pureComputed(function() {
        return instance.status() !== ServiceInstance.Status.NONE && instance !== Service.UNKNOWN_INSTANCE;
    });

    instance.start = function() {
        ServiceInstance.start(instance.id());
    }

    instance.stop = function() {
        ServiceInstance.stop(instance.id());
    }

    instance.restart = function() {
        ServiceInstance.restart(instance.id());
    }
}
ServiceInstance.Status = {
    // TODO: add ForceStopping, Not Responding
    RUNNING: "Up",
    STOPPED: "Stopped",
    STOPPING: "Stopping",
    STARTING: "Starting",
    UNKNOWN: "Unknown",
    START_FAILED: "Start Failed",
    DOWN: "Down",
    NONE: "N/A"
};
ServiceInstance.start = function(id) {
    console.log("Start with ID: " + id);
}

ServiceInstance.stop = function(id) {
    console.log("Stop with ID: " + id);
}

ServiceInstance.restart = function(id) {
    console.log("Restart with ID: " + id);
}