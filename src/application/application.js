function Application(name) {
    var instance = this;

    instance.name = ko.observable(name);
    instance.environments = ko.observableArray();

    instance.addEnvironment = function(name) {
        instance.environments.push(new Environment(name));
    };

    instance.dataRow = new DataRow(null, "page", instance.name);
    instance.addEnvironmentRow = new DataRow(instance.addEnvironment, "application");
}