function Page() {
    var instance = this;

    var REFRESH_INTERVAL_MILLIS = 60000;

    instance.scriptVersion = SCRIPT_VERSION;
    instance.applications = ko.observableArray();
    instance.editMode = ko.observable(false);
    instance.editMode.subscribe(function(newVal) {
        if(!newVal) {
            var setEditingFalse = function(item) {
                item.dataRow.editing(false);
            }
            instance.applications().forEach(function(app) {
                setEditingFalse(app);
                app.environments().forEach(function(env) {
                    setEditingFalse(env);
                    env.hostGroups().forEach(function(hostGroup) {
                        setEditingFalse(hostGroup);
                        hostGroup.hosts().forEach(setEditingFalse);
                    });
                });
            });
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
        var addObservables = function(obj) {
            var objToSave = {};
            Object.keys(obj).forEach(function(key) {
                if(ko.isObservable(obj[key]) && !ko.isComputed(obj[key])) {
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
            objToSave.scriptVersion = instance.scriptVersion;
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
    instance.addDataRow = new DataRow({onSave: instance.addApplication, dataType: "application"});

    instance.load = function() {
        var existingPageJson = localStorage.getItem(Page.DATA_NAME);
        if(existingPageJson) {
            instance.applications([]);
            // TODO: validate saved data
            var existingPage = JSON.parse(existingPageJson);
            // TODO: find better way to do this rather than lots of loops.
            existingPage.applications.forEach(function(app) {
                var application = instance.addApplication(app.name);
                application.isActive(!!app.isActive);
                var isActiveApp = existingPage.activeApp && existingPage.activeApp.name === app.name;
                app.environments.forEach(function(env) {
                    var environment = application.addEnvironment(env.name);
                    environment.isActive(!!env.isActive);
                    var hasActiveEnvironment = isActiveApp && existingPage.activeEnv && existingPage.activeEnv.name === env.name;
                    env.hostGroups.forEach(function(group) {
                        var hostGroup = environment.addHostGroup(group.name);
                        hostGroup.isActive(false);
                        group.hosts.forEach(function(host) {
                            hostGroup.addHost(host.name);
                        });
                        group.services.forEach(function(service) {
                            hostGroup.addService(new Service(service));
                        });
                        if(hasActiveEnvironment && existingPage.activeHostGroup && existingPage.activeHostGroup.name === group.name) {
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
    var clearActive = function(currentActive) {
        if(currentActive()) {
            currentActive().isActive(false);
        }
        currentActive(null);
    }
    instance.activateItem = function(item, element, keepChildren) {
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
    instance.refresh = function() {
        if(instance.activeHostGroup() && !instance.isRefreshing()) {
            instance.isRefreshing(true);
            instance.activeHostGroup().loadData().then(function() {
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