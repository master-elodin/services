function Selections(loadingData) {
    var instance = this;

    instance.currentOptionType = ko.pureComputed(function() {
        if(!loadingData.activeApp()) {
            return Selections.OPTION_TYPES.APPLICATION;
        } else if(!loadingData.activeEnv()) {
            return Selections.OPTION_TYPES.ENVIRONMENT;
        } else if(!loadingData.activeHostGroup()) {
            return Selections.OPTION_TYPES.HOST_GROUP;
        } else {
            return Selections.OPTION_TYPES.NONE;
        }
    });
    instance.showSubHeader = ko.pureComputed(function() {
        return instance.currentOptionType() !== Selections.OPTION_TYPES.NONE;
    });

    instance.currentOptionNames = ko.pureComputed(function() {
        return instance.currentOptionType().findNames(loadingData);
    });
}
var findNames = function(observableArray) {
    return observableArray().map(function(item) { return item.name(); });
}
Selections.OPTION_TYPES = {
    APPLICATION: {
        name: "app",
        findNames: function(loadingData) { return findNames(loadingData.applications); }
    },
    ENVIRONMENT: {
        name: "env",
        findNames: function(loadingData) { return findNames(loadingData.activeApp().environments); }
    },
    HOST_GROUP: {
        name: "host-group",
        findNames: function(loadingData) { return findNames(loadingData.activeEnv().hostGroups); }
    },
    NONE: {
        name: "none",
        findNames: function(loadingData) { return []; }
    }
}