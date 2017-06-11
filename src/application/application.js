function Application(name) {
    var instance = this;

    instance.name = ko.observable(name);
    instance.environments = ko.observableArray();

    instance.addEnvironment = function(name) {
        instance.environments.push(new Environment(name));
    };

    instance.select = function() {

    };

    instance.dataRow = new DataRow(null, "application", instance.name, instance.select);
    instance.addDataRow = new DataRow(instance.addEnvironment, "environment");
}