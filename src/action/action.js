function Action(creationData) {
    this.serviceName = creationData.serviceName;
    // to be modular, use list of indexes of the hosts rather than the hosts themselves
    this.hostIndexes = ko.observableArray();
    this.hostIndexes.push(creationData.hostIndex);
}

Action.prototype.merge = function(otherAction) {
    otherAction.hostIndexes().forEach(function(hostIndex) {
        if(this.hostIndexes().indexOf(hostIndex) < 0) {
            this.hostIndexes.push(hostIndex);
        }
    }, this);
    this.hostIndexes().sort();
}