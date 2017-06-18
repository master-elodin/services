/* Per-host component of Service Health */
function HostHealth(loadingData) {
    var instance = this;

    instance.id = ko.observable(loadingData.id);
    instance.version = ko.observable(loadingData.version);
    instance.hostName = ko.observable(loadingData.hostName);
    instance.status = ko.observable(loadingData.status || ServiceInstance.Status.UNKNOWN);
    instance.isReal = ko.pureComputed(function() {
        return instance.status() !== ServiceInstance.Status.NONE;
    });
    instance.start = loadingData.start;
    instance.stop = loadingData.stop;

    instance.selected = ko.observable(false);
    instance.toggleSelected = createToggle(instance.selected);

    var iconMappings = {};
    iconMappings[ServiceInstance.Status.RUNNING] = { icon: "fa-check-circle-o", colorClass: "host-health__icon--running" };
    iconMappings[ServiceInstance.Status.STOPPED] = { icon: "fa-times-circle-o", colorClass: "host-health__icon--stopped" };
    // TODO: different colors or icons for starting and stopping
    iconMappings[ServiceInstance.Status.STARTING] = { icon: "fa-check-circle-o", colorClass: "host-health__icon--starting" };
    iconMappings[ServiceInstance.Status.STOPPING] = { icon: "fa-times-circle-o", colorClass: "host-health__icon--stopping" };
    iconMappings[ServiceInstance.Status.UNKNOWN] = { icon: "fa-question-circle-o", colorClass: "host-health__icon--unknown" };
    iconMappings[ServiceInstance.Status.NONE] = { icon: "fa-question-circle-o", colorClass: "host-health__icon--unknown" };

    instance.getHealthIcon = ko.pureComputed(function() {
        return iconMappings[instance.status()].icon;
    });

    instance.getHealthColorClass = ko.pureComputed(function() {
        return iconMappings[instance.status()].colorClass;
    });
}