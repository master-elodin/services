/* Per-host component of Service Health */
function HostHealth(loadingData) {
    var instance = this;

    instance.id = ko.observable(loadingData.id);
    instance.hostName = ko.observable(loadingData.hostName);
    instance.isReal = ko.pureComputed(function() {
        return instance.id() !== Service.UNKNOWN_INSTANCE.id();
    });
    instance.version = ko.observable();
    instance.status = ko.observable();
    if(instance.isReal()) {
        instance.version(loadingData.version);
        instance.status(loadingData.status || ServiceInstance.Status.UNKNOWN);
    } else {
        instance.version(ServiceInstance.Status.NONE);
        instance.status(ServiceInstance.Status.NONE);
    }

    instance.selected = ko.observable(false);
    instance.toggleSelected = createToggle(instance.selected);

    var iconMappings = {};
    iconMappings[ServiceInstance.Status.RUNNING] = { icon: "fa-check-circle-o", colorClass: "host-health__icon--running" };
    iconMappings[ServiceInstance.Status.STOPPED] = { icon: "fa-times-circle-o", colorClass: "host-health__icon--stopped" };
    // TODO: different colors or icons for starting and stopping
    iconMappings[ServiceInstance.Status.STARTING] = { icon: "fa-check-circle-o", colorClass: "host-health__icon--starting" };
    iconMappings[ServiceInstance.Status.STOPPING] = { icon: "fa-times-circle-o", colorClass: "host-health__icon--stopping" };
    iconMappings[ServiceInstance.Status.UNKNOWN] = { icon: "fa-question-circle-o", colorClass: "host-health__icon--unknown" };
    iconMappings[ServiceInstance.Status.START_FAILED] = { icon: "fa-exclamation-circle", colorClass: "host-health__icon--failed" };
    iconMappings[ServiceInstance.Status.RESTART_FAILED] = { icon: "fa-exclamation-circle", colorClass: "host-health__icon--failed" };
    iconMappings[ServiceInstance.Status.DOWN] = { icon: "fa-exclamation-circle", colorClass: "host-health__icon--down" };
    iconMappings[ServiceInstance.Status.DOWN] = { icon: "fa-exclamation-circle", colorClass: "host-health__icon--down" };
    iconMappings[ServiceInstance.Status.NONE] = { icon: "fa-question-circle-o", colorClass: "host-health__icon--unknown" };

    instance.getHealthIcon = ko.pureComputed(function() {
        return iconMappings[instance.status()].icon;
    });

    instance.getHealthColorClass = ko.pureComputed(function() {
        var iconMapping = iconMappings[instance.status()];
        if(!iconMapping) {
            console.log("status not found: " + instance.status());
            iconMapping = iconMappings[ServiceInstance.Status.NONE];
        }
        return iconMapping.colorClass;
    });
}