function ServiceController(loadingData) {
    var instance = this;

    instance.page = loadingData.page;

    instance.startStopUnlocked = ko.observable(false);
    instance.toggleStartStop = createToggle(instance.startStopUnlocked);
}