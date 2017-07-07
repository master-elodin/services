function ActionListGroup(creationData) {
    this.name = ko.observable("UNNAMED");
    this.actionLists = ko.observableArray();
    // TODO: update this value when runs complete
    this.numTimesCompleted = 0;

    if(creationData) {
        this.import(creationData);
    }
}

ActionListGroup.prototype.addActionList = function(actionList) {
    this.actionLists.push(actionList);
};

ActionListGroup.prototype.getAllActions = function() {
    var allActions = [];
    this.actionLists().forEach(function(actionList) {
        actionList.actions().forEach(function(action) {
            allActions.push(action);
        });
    });
    return allActions;
};

ActionListGroup.prototype.import = function(importData) {
    this.name(importData.name);
    if(importData.actionLists) {
        this.actionLists(importData.actionLists.map(function(actionList) {
            return new ActionList(actionList);
        }));
    }
};

ActionListGroup.prototype.export = function() {
    return {
        name: this.name(),
        actionLists: this.actionLists().map(function(actionList) {
            return actionList.export();
        }),
        numTimesCompleted: this.numTimesCompleted
    };
};

ActionListGroup.prototype.duplicate = function() {
    return new ActionListGroup(this.export());
}

ActionListGroup.prototype.removeActionList = function(actionList) {
    console.log("Removing action list", actionList);
    this.name("");
    this.actionLists().remove(actionList);
    this.actionLists.valueHasMutated();
}
