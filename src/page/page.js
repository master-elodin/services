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
        var application = new Application(name);
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
                app.environments.forEach(function(env) {
                    var environment = application.addEnvironment(env.name);
                    environment.isActive(!!env.isActive);
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

    // could be application, environment, or host group
    instance.activateItem = function(item) {
        console.log("typeof: " + (typeof item));
        console.log("item: " + item);
    }
}

Page.DATA_NAME = "all-data";