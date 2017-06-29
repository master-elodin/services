function ActionList(creationData) {
    this.delayInMillis = creationData.delayInMillis;
    this.remainingDelay = ko.observable(creationData.delayInMillis);
    this.isComplete = ko.pureComputed(function() {
        return this.remainingDelay() === 0;
    }, this);

    this.actions = ko.observableArray();

    this.countdownInterval = null;
    this.countdownComplete = null;
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

ActionList.prototype.startCountdown = function() {
    clearInterval(this.countdownInterval);

    this.countdownComplete = jQuery.Deferred();
    this.countdownInterval = setInterval((function() {
        this.remainingDelay(this.remainingDelay() - 1);
        if(this.isComplete()) {
            this.countdownComplete.resolve();
        }
    }).bind(this), 1000);
    return this.countdownComplete;
}

ActionList.prototype.pauseCountdown = function() {
    clearInterval(this.countdownInterval);
    if(this.countdownComplete) {
        this.countdownComplete.reject();
    }
}