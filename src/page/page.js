function Page() {
    var instance = this;

    instance.applications = ko.observableArray();
    instance.editMode = ko.observable(false);
    instance.toggleEdit = function() {
        instance.editMode(!instance.editMode());
        instance.save();
    }

    instance.save = function() {
        // TODO: remove unnecessary data before saving
        localStorage.setItem(Page.DATA_NAME, JSON.stringify(ko.mapping.toJS(instance)));
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
                        group.hosts.forEach(function(host) {
                            hostGroup.addHost(host.name);
                        });
                        group.services.forEach(function(service) {
                            hostGroup.addService(service);
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
            if(current() !== newVal) {
                if(current()) {
                    current().isActive(false);
                }
                newVal.isActive(true);
                current(newVal);
                onChange && onChange();
            }
        }
        if(item.constructor === Application) {
            updateActiveItem(instance.activeApp, item, function() { instance.activeEnv(null); instance.activeHostGroup(null); });
        } else if(item.constructor === Environment) {
            updateActiveItem(instance.activeEnv, item, function() { instance.activeHostGroup(null); });
        } else if(item.constructor === HostGroup) {
            updateActiveItem(instance.activeHostGroup, item);
        }
    }
}

Page.DATA_NAME = "all-data";