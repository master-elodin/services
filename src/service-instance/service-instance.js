function ServiceInstance(id, version) {
    var instance = this;

    instance.id = id;
    instance.version = version;
    
    instance.status = ko.observable(ServiceInstance.Status.UNKNOWN);

    instance.isRunning = function() {
        return instance.status() === ServiceInstance.Status.RUNNING;
    }

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
    RUNNING: "Up",
    STOPPED: "Stopped",
    STOPPING: "Stopping",
    STARTING: "Starting",
    UNKNOWN: "Unknown"
};