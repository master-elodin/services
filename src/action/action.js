function Action(creationData) {
    this.serviceName = creationData.serviceName;
    // to be modular, use list of indexes of the hosts rather than the hosts themselves
    this.hostIndexes = creationData.hostIndexes || [];
    if(creationData.hostIndex !== undefined) {
        this.hostIndexes.push(creationData.hostIndex);
    }
    // used for viewmodel only
    this.hostNames = ko.observableArray();
    this.hostNameString = ko.pureComputed(function() {
        return this.hostNames().filter(function(hostName) {
            return !!hostName;
        }).join(", ");
    }, this);
    this.isCompleted = ko.observable(false);
}

Action.prototype.merge = function(otherAction) {
    otherAction.hostIndexes.forEach(function(hostIndex) {
        if(this.hostIndexes.indexOf(hostIndex) < 0) {
            this.hostIndexes.push(hostIndex);
        }
    }, this);
    this.hostIndexes.sort();
}

Action.prototype.export = function() {
    return {
        serviceName: this.serviceName,
        hostIndexes: this.hostIndexes
    }
};