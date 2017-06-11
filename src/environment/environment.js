function Environment(name) {
    var instance = this;

    instance.name = ko.observable(name);

    instance.hostGroups = ko.observableArray();

    instance.addHost = function(hostGroupName) {
        instance.hostGroups.push(new HostGroup(hostGroupName));
        instance.hostGroups.sort(function(a, b) {
            return a.name().localeCompare(b.name());
        });
    }

    instance.dataRow = new DataRow(instance.addHost, "environment", instance.name);
    instance.addHostGroupRow = new DataRow(instance.addHost, "host-group");
}
