function Environment(loadingData) {
    var instance = this;

    instance.page = loadingData.page;
    instance.parent = loadingData.parent;
    instance.name = ko.observable(loadingData.name);

    instance.hostGroups = ko.observableArray();
    instance.addHostGroup = function(hostGroupName) {
        var hostGroup = new HostGroup({name: hostGroupName, page: instance.page, parent: instance});
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

    instance.dataRow = new DataRow(null, "environment", instance.name, instance.select);
    instance.addDataRow = new DataRow(instance.addHostGroup, "host-group");
}
