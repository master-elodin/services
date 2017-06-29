function ActionListGroup() {
    this.actionLists = ko.observableArray();
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