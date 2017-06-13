function Environment(name) {
    var instance = this;

    instance.name = ko.observable(name);

    instance.hostGroups = ko.observableArray();
    instance.addHostGroup = function(hostGroupName) {
        var hostGroup = new HostGroup(hostGroupName);
        instance.hostGroups.push(hostGroup);
        instance.hostGroups.sort(function(a, b) {
            return a.name().localeCompare(b.name());
        });
        return hostGroup;
    };

    instance.isActive = ko.observable(false);
    instance.select = function() {
        instance.isActive(true);
    };

    instance.dataRow = new DataRow(null, "environment", instance.name, instance.select);
    instance.addDataRow = new DataRow(instance.addHostGroup, "host-group");
}
