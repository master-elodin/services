/* Viewmodel for showing host-group health */
function ServiceHealth(loadingData) {
    var instance = this;

    var MAX_NAME_LENGTH = 25;
    var NAME_PART_LENGTH = 5;

    var displayName = loadingData.name;
    if(loadingData.name.length > MAX_NAME_LENGTH) {
        var nameParts = loadingData.name.split(/(?=[A-Z])|(?=\W)|(?=_)/);
        displayName = nameParts.map(function(namePart) {
            namePart = namePart.replace(/(\W)|(_)/, "").substring(0, NAME_PART_LENGTH);
            return namePart.charAt(0).toUpperCase() + namePart.slice(1);
        }).join("");
    }
    instance.name = ko.observable(displayName);
    instance.hostHealths = ko.observableArray();
    instance.addHostHealth = function(hostHealth) {
        instance.hostHealths.push(hostHealth);
    }
}