/* Viewmodel for showing host-group health */
function ServiceHealth(loadingData) {
    var instance = this;

    var MAX_NAME_LENGTH = 25;
    var NAME_PART_LENGTH = 5;

    instance.name = ko.observable(loadingData.name);
    instance.hostHealths = ko.observableArray();
    instance.addHostHealth = function(hostHealth) {
        instance.hostHealths.push(hostHealth);
    }
}