function ServiceInstanceDetails(creationData) {
    this.extraDataLoaded = false;
    var creationDataKeys = Object.keys(creationData);
    for(var i = 0; i < creationDataKeys.length; i++) {
        this[creationDataKeys[i]] = creationData[creationDataKeys[i]];
    }
}
