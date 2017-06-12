function Page() {
    var instance = this;

    instance.applications = ko.observableArray();
    instance.editMode = ko.observable(true);
    instance.toggleEdit = function() {
        instance.editMode(!instance.editMode());
        localStorage.setItem(Page.DATA_NAME, JSON.stringify(ko.mapping.toJS(instance)));
    }

    instance.addApplication = function(name) {
        var application = new Application(name);
        instance.applications.push(application);
        return application;
    };
    instance.addDataRow = new DataRow(instance.addApplication, "application");

    var existingPageJson = localStorage.getItem(Page.DATA_NAME);
    if(existingPageJson) {
        var existingPage = JSON.parse(existingPageJson);
        existingPage.applications.forEach(function(app) {
            instance.addApplication(app);
        });
    }
}

Page.DATA_NAME = "all-data";