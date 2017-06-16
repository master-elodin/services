/* Per-host component of Service Health */
function HostHealth(loadingData) {
    var instance = this;

    // TODO: do these really need to be observables and computeds? Will this data just be overwritten?
    instance.hostName = ko.observable(loadingData.hostName);
    instance.status = ko.observable(loadingData.status || ServiceInstance.Status.UNKNOWN);

    var iconMappings = {};
    iconMappings[ServiceInstance.Status.RUNNING] = { icon: "fa-check-circle-o", colorClass: "host-health__icon--running" };
    iconMappings[ServiceInstance.Status.STOPPED] = { icon: "fa-times-circle-o", colorClass: "host-health__icon--stopped" };
    // TODO: different colors or icons for starting and stopping
    iconMappings[ServiceInstance.Status.STARTING] = { icon: "fa-check-circle-o", colorClass: "host-health__icon--starting" };
    iconMappings[ServiceInstance.Status.STOPPING] = { icon: "fa-times-circle-o", colorClass: "host-health__icon--stopping" };
    iconMappings[ServiceInstance.Status.UNKNOWN] = { icon: "fa-question-circle-o", colorClass: "host-health__icon--unknown" };

    instance.getHealthIcon = ko.pureComputed(function() {
        return iconMappings[instance.status()].icon;
    });

    instance.getHealthColorClass = ko.pureComputed(function() {
        return iconMappings[instance.status()].colorClass;
    });
}