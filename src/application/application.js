function Application(loadingData) {
    var instance = this;

    instance.page = loadingData.page;
    instance.name = ko.observable(loadingData.name);

    instance.environments = ko.observableArray();
    instance.addEnvironment = function(name) {
        var environment = new Environment({name: name, page: instance.page});
        instance.environments.push(environment);
        return environment;
    };

    instance.isActive = ko.observable(false);
    instance.select = function() {
        instance.isActive(!instance.isActive());
        if(instance.isActive()) {
            instance.page.activateItem(instance);
        }
    };

    instance.dataRow = new DataRow(null, "application", instance.name, instance.select);
    instance.addDataRow = new DataRow(instance.addEnvironment, "environment");
}