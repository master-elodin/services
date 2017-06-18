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
        return instance.status() !== ServiceInstance.Status.NONE;
    });

    instance.start = function() {
        console.log( "Start!" );
    }

    instance.stop = function() {
        console.log( "Stop!" );
    }

    instance.restart = function() {
        console.log( "Restart!" );
    }
}
ServiceInstance.Status = {
    // TODO: find real statuses
    // TODO: add ForceStopping, Not Responding
    RUNNING: "Up",
    STOPPED: "Stopped",
    STOPPING: "Stopping",
    STARTING: "Starting",
    UNKNOWN: "Unknown",
    NONE: "None"
};
