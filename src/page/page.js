function Page() {
    var instance = this;

    var REFRESH_INTERVAL_MILLIS = 60000;

    instance.scriptVersion = ko.observable(SCRIPT_VERSION);

    instance.editMode = ko.observable(false);
    instance.editMode.subscribe(function(newVal) {
        if(!newVal) {
            instance.save();
        }
    });
    instance.toggleEdit = createToggle(instance.editMode);
    instance.cancelEdit = function() {
        instance.load();
        instance.editMode(false);
    }

    // instance.serviceController = new ServiceController({activeHostGroup: instance.activeHostGroup});
    // instance.startStopUnlocked = instance.serviceController.startStopUnlocked;

    instance.showHostGroupHealth = ko.pureComputed(function() {
        return instance.showRefreshIcon() && !instance.activeService();
    });

    instance.showServiceActions = ko.pureComputed(function() {
        return instance.showRefreshIcon() && instance.activeService();
    });

    instance.showRefreshIcon = ko.pureComputed(function() {
        return !!instance.activeHostGroup() && !instance.editMode();
    });

    instance.pageData = new Item();
    instance.pageData.scriptVersion = SCRIPT_VERSION;

    instance.activeApp = ko.observable();
    instance.activeEnv = ko.observable();
    instance.activeHostGroup = ko.observable();
    instance.activeService = ko.observable();
    instance.clearAllActive = function() {
        instance.activeApp(null);
        instance.activeEnv(null);
        instance.activeHostGroup(null);
        instance.activeService(null);
    };
    instance.activateItem = function(item) {
        if(item.childrenType === Item.ChildrenTypes.ENV) {
            instance.activeApp(item);
        } else if(item.childrenType === Item.ChildrenTypes.HOST_GROUP) {
            instance.activeEnv(item);
        } else if(item.childrenType === Item.ChildrenTypes.HOST) {
            instance.activeHostGroup(item);
        }
    }

    var getSettingsAsJsonText = function() {
        return JSON.stringify(instance.pageData.export());
    };

    instance.save = function() {
        localStorage.setItem(Page.DATA_NAME, getSettingsAsJsonText());
    };

    instance.load = function() {
        var existingData = localStorage.getItem(Page.DATA_NAME);
        if(existingData) {
            instance.pageData.import(JSON.parse(existingData));
        } else {
            instance.editMode(true);
        }
    };

    // TODO: refresh on timer
    instance.isRefreshing = ko.observable(false);
    instance.refreshError = ko.observable();
    instance.refresh = function() {
        if(!instance.isRefreshing()) {
            instance.isRefreshing(true);
            instance.activeHostGroup().loadData().then(function() {
                instance.refreshError(null);
            }).fail(function(error) {
                instance.refreshError(error);
            }).always(function() {
                instance.isRefreshing(false);
            });
        }
    };

    instance.filterValue = ko.observable("");

    instance.downloadConfig = function() {
        downloadAsFile(getSettingsAsJsonText(), "service-config.json");
    };

    instance.uploadConfig = function() {
        uploadFile("#upload-configuration-input", function(configText) {
            localStorage.setItem(Page.DATA_NAME, configText);
            instance.load();
        });
    };
};

Page.DATA_NAME = "all-data";