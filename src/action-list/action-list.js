function ActionList(creationData) {
    this.delayInMillis = creationData.delayInMillis;
    this.remainingDelay = ko.observable(creationData.delayInMillis);

    this.actions = ko.observableArray();
}

ActionList.prototype.addAction = function(newAction) {
    var existingAction = this.actions().find(function(action) {
        return action.serviceName === newAction.serviceName;
    });

    if(existingAction) {
        existingAction.merge(newAction);
    } else {
        this.actions.push(newAction);

        this.actions.sort(function(a, b) {
            return sortStrings(a.serviceName, b.serviceName);
        });
    }
};