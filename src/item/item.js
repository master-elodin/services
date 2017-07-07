function Item(importData) {
    this.name = ko.observable();
    this.children = ko.observableArray();

    this.isExpanded = ko.observable(false);
    this.toggleExpanded = createToggle(this.isExpanded);
    this.isActive = ko.observable(false);
    this.isActive.subscribe(function(newVal) {
        if(newVal) {
            this.isExpanded(true);
        }
    }, this);
    this.isEditingName = ko.observable(false);
    this.toggleEditingName = createToggle(this.isEditingName);
    var previousName = "";
    this.isEditingName.subscribe(function(newVal) {
        if(!newVal && previousName !== this.name()) {
            page.save();
        } else {
            previousName = this.name();
            if(newVal) {
                var inputId = this.getInputId();
                setTimeout(function() {
                    // timeout to allow time for knockout to finish its bindings
                    jQuery("#" + inputId).focus();
                }, 100);
            }
        }
    }, this);

    this.newChildName = ko.observable();

    if(importData) {
        this.import(importData);
    }
}

Item.prototype.import = function(data) {
    this.name(data.name);

    this.parent = data.parent;
    this.childrenType = data.childrenType;

    if(data[data.childrenType]) {
        this.children(data[data.childrenType].map(function(child) {
            // parent example:
            // activating a host-group should also activate its parent environment and app
            child.parent = this;
            return new Item(child);
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
        this.children.push(new Item({name: this.newChildName(), parent: this, childrenType: this.getNextChildrenType(), isExpanded: true}));
        this.children.sort(function(a, b) {
            return sortStrings(a.name(), b.name());
        });
        page.save();
    }
    this.newChildName(null);
}

Item.prototype.getChildrenNames = function() {
    return this.children().map(function(child) {
        return child.name();
    });
}

Item.prototype.getId = function() {
    if(!this.parent) {
        return this.name();
    } else {
        return this.parent.getId() + "-" + this.name();
    }
}

Item.prototype.getInputId = function() {
    return "input-" + this.getId();
}

Item.prototype.getNextChildrenType = function() {
    var childrenTypeKeys = Object.keys(Item.ChildrenTypes);
    for(var i = 0; i < childrenTypeKeys.length; i++) {
        if(Item.ChildrenTypes[childrenTypeKeys[i]] === this.childrenType) {
            return Item.ChildrenTypes[childrenTypeKeys[i + 1]];
        }
    }
    return null;
}

Item.prototype.removeChild = function(child) {
    this.children().remove(child);
    this.children.valueHasMutated();
}

Item.ChildrenTypes = {
    APP: "applications",
    ENV: "environments",
    HOST_GROUP: "hostGroups",
    HOST: "hosts"
}