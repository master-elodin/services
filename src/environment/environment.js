function Environment(loadingData) {
    var instance = this;

    instance.page = loadingData.page;
    instance.parent = loadingData.parent;
    instance.name = ko.observable(loadingData.name);

    instance.hostGroups = ko.observableArray();
    instance.addHostGroup = function(hostGroupName) {
        var hostGroup = new HostGroup({name: hostGroupName, page: instance.page, parent: instance, onDelete: createOnDelete(instance.hostGroups)});
        instance.hostGroups.push(hostGroup);
        instance.hostGroups.sort(function(a, b) {
            return a.name().localeCompare(b.name());
        });
        return hostGroup;
    };

    instance.isActive = ko.observable(false);
    instance.select = function() {
        instance.isActive(!instance.isActive());
        if(instance.isActive()) {
            instance.page.activateItem(instance);
        }
        instance.page.save();
    };

    instance.dataRow = new DataRow({dataType: "environment", name: instance.name, onSelect: instance.select, onDelete: loadingData.onDelete});
    instance.addDataRow = new DataRow({onSave: instance.addHostGroup, dataType: "host-group"});
}
