function Page() {
    var instance = this;

    instance.applications = ko.observableArray();

    instance.addApplication = function(name) {
        instance.applications.push(new Application(name));
    };
    instance.dataRow = new DataRow(instance.addApplication, "page");
}