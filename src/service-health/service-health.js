/* Viewmodel for showing host-group health */
function ServiceHealth(loadingData) {
    var instance = this;

    var displayName = loadingData.name;
    if(loadingData.name.length > 20) {
        var nameParts = loadingData.name.split(/(?=[A-Z])|(?=\W)|(?=_)/);
        displayName = nameParts.map(function(namePart) {
            namePart = namePart.replace(/(\W)|(_)/, "").substring(0, 4);
            return namePart.charAt(0).toUpperCase() + namePart.slice(1);
        }).join("");
    }
    instance.name = ko.observable(displayName);
    instance.hostHealths = ko.observableArray();
    instance.addHostHealth = function(hostHealth) {
        instance.hostHealths.push(hostHealth);
    }
}