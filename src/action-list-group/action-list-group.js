function ActionListGroup() {
    this.actionLists = ko.observableArray();
}

ActionListGroup.prototype.addActionList = function(actionList) {
    this.actionLists.push(actionList);
}