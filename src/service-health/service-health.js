/* Viewmodel for showing host-group health */
function ServiceHealth(loadingData) {
    var instance = this;

    instance.name = ko.observable(loadingData.name);
    instance.hostHealths = ko.observableArray();
    instance.addHostHealth = function(hostHealth) {
        instance.hostHealths.push(hostHealth);
    }
}