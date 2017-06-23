function Item(importData) {
    var instance = this;

    this.name = ko.observable();
    this.children = ko.observableArray();

    this.isExpanded = ko.observable(false);
    this.toggleExpanded = createToggle(this.isExpanded);
    this.isActive = ko.observable(false);
    // don't save edit state
    this.isEditingName = ko.observable(false);

    this.newChildName = ko.observable();

    if(importData) {
        instance.import(importData);
    }
}

Item.prototype.import = function(data) {
    this.name(data.name);
    if(data.childrenType) {
        this.childrenType = data.childrenType;
        this.children(data[data.childrenType].map(function(child) {
            var childItem = new Item(child);
            // parent example:
            // activating a host-group should also activate its parent environment and app
            childItem.parent = this;
            return childItem;
        }, this));
    }

    this.isExpanded(!!data.isExpanded);
    this.isActive(!!data.isActive);
}

Item.prototype.export = function() {
    var data = {
        name: this.name(),
        isExpanded: this.isExpanded(),
        isActive: this.isActive()
    };
    if(this.childrenType) {
        data.childrenType = this.childrenType;
        data[this.childrenType] = this.children().map(function(child) {
            return child.export();
        });
    }
    return data;
}

Item.prototype.findChildByName = function(childName) {
    return this.children().find(function(child) {
        return child.name() === childName;
    });
};

Item.prototype.addChild = function() {
    if(!this.findChildByName(this.newChildName())) {
        this.children.push(new Item({name: this.newChildName()}));
        this.children.sort(function(a, b) {
            return sortStrings(a.name(), b.name());
        });
        page.save();
    }
    this.newChildName(null);
}

Item.prototype.getId = function() {
    if(!this.parent) {
        return this.name();
    } else {
        return this.parent.getId() + "-" + this.name();
    }
}

Item.ChildrenTypes = {
    APP: "applications",
    ENV: "environments",
    HOST_GROUP: "hostGroups",
    HOST: "hosts"
}