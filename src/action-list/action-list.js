function ActionList(creationData) {
    this.delayInMillis = 0;
    this.remainingDelay = ko.observable();

    this.hasStarted = ko.observable(false);
    this.isCountdownComplete = ko.pureComputed(function() {
        return this.hasStarted() && this.remainingDelay() < 1;
    }, this);
    this.isComplete = ko.pureComputed(function() {
        return this.isCountdownComplete() && this.actions().every(function(action) {
            return action.isCompleted();
        });
    }, this);

    this.actions = ko.observableArray();

    this.countdownInterval = null;
    this.countdownDeferred = null;

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

    this.countdownDeferred = jQuery.Deferred();
    if(this.delayInMillis > 0) {
        this.countdownInterval = setInterval((function() {
            this.remainingDelay(this.remainingDelay() - 1);
            if(this.isCountdownComplete()) {
                clearInterval(this.countdownInterval);
                this.countdownDeferred.resolve();
            }
        }).bind(this), 1000);
    } else {
        this.countdownDeferred.resolve();
    }
    return this.countdownDeferred;
}

ActionList.prototype.pauseCountdown = function() {
    clearInterval(this.countdownInterval);
    if(this.countdownDeferred) {
        this.countdownDeferred.reject();
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

ActionList.prototype.reset = function() {
    this.remainingDelay(this.delayInMillis);
    this.hasStarted(false);
    this.actions().forEach(function(action) {
        action.isCompleted(false);
    });
}