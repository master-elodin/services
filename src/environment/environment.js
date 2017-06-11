function Environment(name) {
    var instance = this;

    instance.name = ko.observable(name);

    instance.hostGroups = ko.observableArray();

    instance.addHostGroup = function(hostGroupName) {
        instance.hostGroups.push(new HostGroup(hostGroupName));
        instance.hostGroups.sort(function(a, b) {
            return a.name().localeCompare(b.name());
        });
    };

    instance.select = function() {

    };

    instance.dataRow = new DataRow(null, "environment", instance.name, instance.select);
    instance.addDataRow = new DataRow(instance.addHostGroup, "host-group");
}
