function Page() {
    var instance = this;

    instance.applications = ko.observableArray();
    instance.editMode = ko.observable(false);
    instance.toggleEdit = function() {
        instance.editMode(!instance.editMode());
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
                app.environments.forEach(function(env) {
                    var environment = application.addEnvironment(env.name);
                    env.hostGroups.forEach(function(group) {
                        var hostGroup = environment.addHostGroup(group.name);
                        group.hosts.forEach(function(host) {
                            hostGroup.addHost(host.name);
                        });
                        group.services.forEach(function(service) {
                            hostGroup.addService(service);
                        });
                    });
                });
            });
        }
    };
}

Page.DATA_NAME = "all-data";