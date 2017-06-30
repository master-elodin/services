function ActionList(creationData) {
    this.delayInMillis = 0;
    this.remainingDelay = ko.observable();
    
    this.hasStarted = ko.observable(false);
    this.isComplete = ko.pureComputed(function() {
        return this.hasStarted() && this.remainingDelay() < 1;
    }, this);

    this.actions = ko.observableArray();

    this.countdownInterval = null;
    this.countdownComplete = null;

    if(creationData) {
        this.import(creationData);
    }
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

    this.hasStarted(true);

    this.countdownComplete = jQuery.Deferred();
    if(this.delayInMillis > 0) {
        this.countdownInterval = setInterval((function() {
            this.remainingDelay(this.remainingDelay() - 1);
            if(this.isComplete()) {
                clearInterval(this.countdownInterval);
                this.countdownComplete.resolve();
            }
        }).bind(this), 1000);
    } else {
        this.countdownComplete.resolve();
    }
    return this.countdownComplete;
}

ActionList.prototype.pauseCountdown = function() {
    clearInterval(this.countdownInterval);
    if(this.countdownComplete) {
        this.countdownComplete.reject();
    }
};

ActionList.prototype.import = function(importData) {
    this.delayInMillis = importData.delayInMillis;
    this.remainingDelay(importData.delayInMillis);
    if(importData.actions) {
        importData.actions.forEach(function(actionData) {
            this.actions.push(new Action(actionData));
        }, this);
    }
};

ActionList.prototype.export = function() {
    return {
        delayInMillis: this.delayInMillis,
        actions: this.actions().map(function(action) {
            return action.export();
        })
    }
};