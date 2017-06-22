function Page() {
    var instance = this;

    var REFRESH_INTERVAL_MILLIS = 600000;

    instance.scriptVersion = ko.observable(SCRIPT_VERSION);
    instance.applications = ko.observableArray();
    instance.editMode = ko.observable(false);
    instance.editMode.subscribe(function(newVal) {
        if(!newVal) {
            instance.save();
        }
    });
    instance.toggleEdit = function() {
        instance.editMode(!instance.editMode());
    };
    instance.cancelEdit = function() {
        instance.load();
        instance.editMode(false);
    }

    instance.showHostGroupHealth = ko.pureComputed(function() {
        return instance.showRefreshIcon() && !instance.activeService();
    });

    instance.showServiceActions = ko.pureComputed(function() {
        return instance.showRefreshIcon() && instance.activeService();
    });

    instance.showRefreshIcon = ko.pureComputed(function() {
        return !!instance.activeHostGroup() && !instance.editMode();
    });

    var getSettingsAsJsonText = function() {
        var SAVEABLE_TYPES = [String, Boolean];
        var IGNORED_FIELD_NAMES = ["activeApp", "activeEnv", "activeHostGroup", "editingName", "startStopUnlocked", "filterValue", "isRefreshing", "editMode"];
        var addObservables = function(obj) {
            var objToSave = {};
            Object.keys(obj).forEach(function(key) {
                if(IGNORED_FIELD_NAMES.indexOf(key) === -1 && ko.isObservable(obj[key]) && !ko.isComputed(obj[key])) {
                    var value = obj[key]();
                    if(!value || SAVEABLE_TYPES.indexOf(value.constructor) > -1) {
                        objToSave[key] = value;
                    } else if(value.constructor === Array) {
                        objToSave[key] = [];
                        value.forEach(function(val) {
                            objToSave[key].push(addObservables(val));
                        });
                    } else {
                        objToSave[key] = addObservables(value);
                    }
                }
            });
            return objToSave;
        }
        return JSON.stringify(ko.mapping.toJS(addObservables(instance)));
    }
    instance.save = function(doNotActivate) {
        localStorage.setItem(Page.DATA_NAME, getSettingsAsJsonText());
        if(instance.activeHostGroup() && !doNotActivate) {
            // re-activate in order to re-load
            instance.activateItem(instance.activeHostGroup());
        }
    }

    instance.addApplication = function(name) {
        var application = new Application({name: name, page: instance, onDelete: createOnDelete(instance.applications)});
        instance.applications.push(application);
        return application;
    };

    instance.load = function() {
        var existingPageJson = localStorage.getItem(Page.DATA_NAME);
        if(existingPageJson) {
            instance.applications([]);
            // TODO: validate saved data
            var existingPage = JSON.parse(existingPageJson);
            // TODO: find better way to do this rather than lots of loops.
            existingPage.applications.forEach(function(app) {
                var application = instance.addApplication(app.name);
                application.isExpanded(!!app.isExpanded);
                var isActiveApp = !!app.isActive;
                app.environments.forEach(function(env) {
                    var environment = application.addEnvironment(env.name);
                    environment.isExpanded(!!env.isExpanded);
                    var hasActiveEnvironment = !!env.isActive;
                    env.hostGroups.forEach(function(group) {
                        var hostGroup = environment.addHostGroup(group.name);
                        hostGroup.isExpanded(!!group.isExpanded);
                        group.hosts.forEach(function(host) {
                            hostGroup.addHost(host.name);
                        });
                        group.services.forEach(function(service) {
                            hostGroup.addService(new Service(service));
                        });
                        if(!!group.isActive) {
                            instance.activateItem(hostGroup, true);
                        }
                    });
                    if(hasActiveEnvironment && !instance.activeHostGroup()) {
                        instance.activateItem(environment, true);
                    }
                });
                if(isActiveApp && !instance.activeEnv()) {
                    instance.activateItem(application, true);
                }
            });
        } else {
            instance.editMode(true);
        }
    };

    instance.activeApp = ko.observable();
    instance.activeEnv = ko.observable();
    instance.activeHostGroup = ko.observable();
    instance.activeService = ko.observable();
    instance.selections = new Selections({
        activeApp: instance.activeApp, 
        activeEnv: instance.activeEnv, 
        activeHostGroup: instance.activeHostGroup, 
        applications: instance.applications
    });
    var clearActive = function(currentActive) {
        if(currentActive()) {
            currentActive().isActive(false);
        }
        currentActive(null);
    }

    instance.isItemActive = function(item) {
        var isActiveApp = item.constructor === Application && instance.activeApp() === item;
        var isActiveEnv = item.constructor === Environment && instance.activeEnv() === item;
        var isActiveHostGroup = item.constructor === HostGroup && instance.activeHostGroup() === item;
        return isActiveApp || isActiveEnv || isActiveHostGroup;
    };

    instance.clearEditingNames = function() {
        instance.applications().forEach(function(app) {
            app.editingName(false);
            app.environments().forEach(function(env) {
                env.editingName(false);
                env.hostGroups().forEach(function(hostGroup) {
                    hostGroup.editingName(false);
                    hostGroup.hosts().forEach(function(host) {
                        host.editingName(false);
                    });
                });
            });
        });
    };

    instance.activateItem = function(item, element, keepChildren) {
        if(instance.editMode()) {
            item.editingName(true);
            return;
        }
        var updateActiveItem = function(current, newVal, onChange) {
            clearActive(current);
            newVal.isActive(true);
            current(newVal);
            onChange();
            instance.save(true);
        }
        instance.startStopUnlocked(false);
        if(item.constructor === Application) {
            var onChange = function() {
                if(!keepChildren) {
                    clearActive(instance.activeEnv);
                    clearActive(instance.activeHostGroup);
                    clearActive(instance.activeService);
                }
            };
            updateActiveItem(instance.activeApp, item, onChange);
        } else if(item.constructor === Environment) {
            var onChange = function() {
                instance.activateItem(item.parent, null, true);
                if(!keepChildren) {
                    clearActive(instance.activeHostGroup);
                    clearActive(instance.activeService);
                }
            };
            updateActiveItem(instance.activeEnv, item, onChange);
        } else if(item.constructor === HostGroup) {
            var onChange = function() {
                instance.activateItem(item.parent, null, true);
                instance.refresh();
                clearActive(instance.activeService);
                jQuery(".service-page__filter input").focus();
            };
            updateActiveItem(instance.activeHostGroup, item, onChange);
        }
    };
    instance.selectService = function(serviceHealth) {
        if(instance.startStopUnlocked()) {
            // If any unchecked, check all. If all checked, uncheck all
            var anyUnchecked = serviceHealth.hostHealths().some(function(hostHealth) {
                return !hostHealth.selected();
            });
            serviceHealth.hostHealths().forEach(function(hostHealth) {
                hostHealth.selected(anyUnchecked);
            });
        } else {
            instance.activeService(instance.activeHostGroup().getService(serviceHealth.name()));
        }
    };
    instance.clearAllActive = function() {
        clearActive(instance.activeApp);
        clearActive(instance.activeEnv);
        clearActive(instance.activeHostGroup);
        clearActive(instance.activeService);
    };

    setInterval(function() {
        // refresh every minute
        instance.refresh();
    }, REFRESH_INTERVAL_MILLIS);
    instance.isRefreshing = ko.observable(false);
    instance.refreshError = ko.observable();
    instance.refresh = function() {
        if(instance.activeHostGroup() && !instance.isRefreshing()) {
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

    instance.serviceController = new ServiceController({activeHostGroup: instance.activeHostGroup});
    instance.startStopUnlocked = instance.serviceController.startStopUnlocked;
}

Page.DATA_NAME = "all-data";