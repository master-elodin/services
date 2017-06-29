function Action(creationData) {
    this.serviceName = creationData.serviceName;
    // to be modular, use list of indexes of the hosts rather than the hosts themselves
    this.hostIndexes = [];
    this.hostIndexes.push(creationData.hostIndex);
    // used for viewmodel only
    this.hostNames = ko.observableArray();
}

Action.prototype.merge = function(otherAction) {
    otherAction.hostIndexes.forEach(function(hostIndex) {
        if(this.hostIndexes.indexOf(hostIndex) < 0) {
            this.hostIndexes.push(hostIndex);
        }
    }, this);
    this.hostIndexes.sort();
}