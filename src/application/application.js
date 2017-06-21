function Application(loadingData) {
    var instance = this;

    instance.page = loadingData.page;
    instance.name = ko.observable(loadingData.name);

    instance.environments = ko.observableArray();
    instance.addEnvironment = function(name) {
        var environment = new Environment({name: name, page: instance.page, parent: instance, onDelete: createOnDelete(instance.environments)});
        instance.environments.push(environment);
        return environment;
    };

    instance.isActive = ko.observable(false);
    instance.select = function() {
        instance.isActive(!instance.isActive());
        if(instance.isActive()) {
            instance.page.activateItem(instance);
        }
        instance.page.save();
    };

    instance.isExpanded = ko.observable(instance.isActive());
    instance.toggleExpanded = createToggle(instance.isExpanded);

    instance.dataRow = new DataRow({dataType: "application", name: instance.name, onSelect: instance.select, onDelete: loadingData.onDelete, owner: instance});
    instance.addDataRow = new DataRow({onSave: instance.addEnvironment, dataType: "environment"});
}