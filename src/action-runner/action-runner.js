function ActionRunner(creationData) {
    this.actionListGroup = creationData.actionListGroup;
    this.actionType = creationData.actionType;
    this.hostNameList = creationData.hostNameList;

    this.isPaused = ko.observable(false);
}

ActionRunner.prototype.run = function() {

};

ActionRunner.prototype.pause = function() {

};