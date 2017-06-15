/* Per-host component of Service Health */
function HostHealth(loadingData) {
    var instance = this;

    // TODO: do these really need to be observables and computeds? Will this data just be overwritten?
    instance.hostName = ko.observable(loadingData.hostName);
    instance.status = ko.observable(loadingData.status || ServiceInstance.Status.UNKNOWN);

    var iconMappings = {};
    iconMappings[ServiceInstance.Status.RUNNING] = "fa-check-circle-o";
    iconMappings[ServiceInstance.Status.STOPPED] = "fa-times-circle-o";
    // TODO: different colors or icons for starting and stopping
    iconMappings[ServiceInstance.Status.STOPPING] = "fa-times-circle-o";
    iconMappings[ServiceInstance.Status.STARTING] = "fa-check-circle-o";
    iconMappings[ServiceInstance.Status.UNKNOWN] = "fa-question-circle-o";
    instance.getHealthIcon = ko.pureComputed(function() {
        return iconMappings[instance.status()];
    });
}