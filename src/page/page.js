function Page() {
    var instance = this;

    instance.applications = ko.observableArray();
    instance.editMode = ko.observable(true);

    instance.addApplication = function(name) {
        instance.applications.push(new Application(name));
    };
    instance.addNewDataRow = new DataRow(instance.addApplication, "page");
}