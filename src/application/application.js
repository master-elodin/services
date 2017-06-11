function Application(name) {
    var instance = this;

    instance.name = ko.observable(name);
    instance.environments = ko.observableArray();

    instance.addEnvironment = function(name) {
        console.log("add environment!");
    };

    instance.dataRow = new DataRow(instance.addEnvironment, "application", instance.name);
}