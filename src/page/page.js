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

    instance.serviceController = new ServiceController({activeHostGroup: instance.activeHostGroup});
    instance.startStopUnlocked = instance.serviceController.startStopUnlocked;

    instance.showHostGroupHealth = ko.pureComputed(function() {
        return instance.showRefreshIcon() && !instance.activeService();
    });

    instance.showServiceActions = ko.pureComputed(function() {
        return instance.showRefreshIcon() && instance.activeService();
    });

    instance.showRefreshIcon = ko.pureComputed(function() {
        return !!instance.activeHostGroup() && !instance.editMode();
    });

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

    var setActiveState = function(activeHolder, newActive) {
        if(activeHolder()) {
            activeHolder().isActive(false);
        }
        newActive.isActive(true);
        activeHolder(newActive);
    };

    instance.activateItem = function(item) {
        if(item.childrenType === Item.ChildrenTypes.ENV) {
            setActiveState(instance.activeApp, item);
        } else if(item.childrenType === Item.ChildrenTypes.HOST_GROUP) {
            setActiveState(instance.activeApp, item.parent);
            setActiveState(instance.activeEnv, item);
        } else if(item.childrenType === Item.ChildrenTypes.HOST) {
            setActiveState(instance.activeApp, item.parent.parent);
            setActiveState(instance.activeEnv, item.parent);
            setActiveState(instance.activeHostGroup, item);
        }
    }

    instance.pageData = new Item({name: "configuration", childrenType: "applications", applications: []});
    instance.pageData.scriptVersion = SCRIPT_VERSION;
    var getSettingsAsJsonText = function() {
        return JSON.stringify(instance.pageData.export());
    };

    instance.save = function() {
        var settingsAsJsonText = getSettingsAsJsonText();
        localStorage.setItem(Page.DATA_NAME, settingsAsJsonText);
        console.log("Saved page data as JSON", instance.pageData.export());
    };

    instance.load = function() {
        var existingData = JSON.parse(localStorage.getItem(Page.DATA_NAME) || "{}");
        if(existingData && existingData.applications) {
            console.log("Adding children types...");
            existingData.childrenType = Item.ChildrenTypes.APP;
            existingData.name = "configuration";
            existingData.applications.forEach(function(app) {
                app.childrenType = Item.ChildrenTypes.ENV;
                app.environments.forEach(function(env) {
                    env.childrenType = Item.ChildrenTypes.HOST_GROUP;
                    env.hostGroups.forEach(function(hostGroup) {
                        hostGroup.childrenType = Item.ChildrenTypes.HOST;
                    });
                });
            });
            console.log("Loading data", existingData);
            instance.pageData.import(existingData);
            console.log("Page data after load", instance.pageData.export());
        } else {
            console.log("Tried to load but no valid existing data found", existingData);
            console.log("Using page data:", instance.pageData.export());
            instance.editMode(true);
        }
    };

    instance.servicesByHostGroupId = {};
    instance.getServicesForActiveHostGroup = ko.pureComputed(function() {
        return instance.activeHostGroup() && instance.servicesByHostGroupId[instance.activeHostGroup().getId()] || [];
    });
    instance.activeHostGroup.subscribe(function(newVal) {
        if(newVal) {
            instance.refresh();
        }
    });

    var setErrorMessage = function(error) {
        instance.errorMessage(error);
    };

    var clearErrorMessage = function() {
        instance.errorMessage(null);
    };

    instance.addServiceData = function(serviceList) {
        var existingServiceList = instance.getServicesForActiveHostGroup();
        serviceList.forEach(function(newService) {
            var existingService = existingServiceList.find(function(existingService) {
                return newService.name === existingService.name;
            });
            if(existingService) {
                existingService.merge(newService);
            } else {
                existingServiceList.push(newService);
            }
        });

        existingServiceList.sort(function(a, b) {
            return sortStrings(a.name, b.name);
        });

        clearErrorMessage();
    };

    // TODO: refresh on timer
    instance.isRefreshing = ko.observable(false);
    instance.errorMessage = ko.observable();
    instance.refresh = function() {
        if(!instance.isRefreshing() && instance.activeHostGroup()) {
            instance.isRefreshing(true);
            Data.getDataForHosts(instance.activeHostGroup().getChildrenNames())
            .then(instance.addServiceData)
            .fail(setErrorMessage)
            .always(function() {
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