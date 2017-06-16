function Page() {
    var instance = this;

    instance.applications = ko.observableArray();
    instance.editMode = ko.observable(false);
    instance.toggleEdit = function() {
        instance.editMode(!instance.editMode());
        if(!instance.editMode()) {
            instance.save();
        }
    }

    instance.showHostGroupHealth = ko.pureComputed(function() {
        return !!instance.activeHostGroup() && !instance.editMode();
    });

    instance.save = function() {
        var SAVEABLE_TYPES = [String, Boolean];
        var addObservables = function(obj) {
            var objToSave = {};
            Object.keys(obj).forEach(function(key) {
                if(ko.isObservable(obj[key])) {
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
        var objToSave = addObservables(instance);
        localStorage.setItem(Page.DATA_NAME, JSON.stringify(ko.mapping.toJS(objToSave)));
        if(instance.activeHostGroup()) {
            // re-activate in order to re-load
            instance.activateItem(instance.activeHostGroup());
        }
    }

    instance.addApplication = function(name) {
        var application = new Application({name: name, page: instance});
        instance.applications.push(application);
        return application;
    };
    instance.addDataRow = new DataRow(instance.addApplication, "application");

    instance.load = function() {
        var existingPageJson = localStorage.getItem(Page.DATA_NAME);
        if(existingPageJson) {
            var existingPage = JSON.parse(existingPageJson);
            // TODO: find better way to do this rather than lots of loops.
            existingPage.applications.forEach(function(app) {
                var application = instance.addApplication(app.name);
                application.isActive(!!app.isActive);
                var isActiveApp = existingPage.activeApp && existingPage.activeApp.name === app.name;
                if(isActiveApp) {
                    instance.activateItem(application);
                }
                app.environments.forEach(function(env) {
                    var environment = application.addEnvironment(env.name);
                    environment.isActive(!!env.isActive);
                    var isActiveEnv = isActiveApp && existingPage.activeEnv && existingPage.activeEnv.name === env.name;
                    if(isActiveEnv) {
                        instance.activateItem(environment);
                    }
                    env.hostGroups.forEach(function(group) {
                        var hostGroup = environment.addHostGroup(group.name);
                        hostGroup.isActive(!!group.isActive);
                        if(isActiveEnv && existingPage.activeHostGroup && existingPage.activeHostGroup.name === group.name) {
                            instance.activateItem(hostGroup);
                        }
                        group.hosts.forEach(function(host) {
                            hostGroup.addHost(host.name);
                        });
                        group.services.forEach(function(service) {
                            hostGroup.addService(new Service(service));
                        });
                    });
                });
            });
        } else {
            instance.editMode(true);
        }
    };

    instance.activeApp = ko.observable();
    instance.activeEnv = ko.observable();
    instance.activeHostGroup = ko.observable();
    instance.activateItem = function(item) {
        var updateActiveItem = function(current, newVal, onChange) {
            if(current()) {
                current().isActive(false);
            }
            onChange();
            newVal.isActive(true);
            current(newVal);
        }
        if(item.constructor === Application) {
            var onChange = function() {
                instance.activeEnv(null); 
                instance.activeHostGroup(null);
            };
            updateActiveItem(instance.activeApp, item, onChange);
        } else if(item.constructor === Environment) {
            var onChange = function() {
                instance.activateItem(item.parent);
                instance.activeHostGroup(null);
            };
            updateActiveItem(instance.activeEnv, item, onChange);
        } else if(item.constructor === HostGroup) {
            var onChange = function() {
                instance.activateItem(item.parent);
                item.loadData();
            };
            updateActiveItem(instance.activeHostGroup, item, onChange);
        }
    };

    instance.isRefreshing = ko.observable(false);
    instance.refresh = function() {
        if(instance.activeHostGroup() && !instance.isRefreshing()) {
            instance.isRefreshing(true);
            instance.activeHostGroup().loadData().then(function() {
                instance.isRefreshing(false);
            });
        }
    };
}

Page.DATA_NAME = "all-data";