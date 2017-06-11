function Environment(name) {
    var instance = this;

    instance.name = ko.observable(name);

    instance.hosts = ko.observableArray();

    instance.addHost = function(hostName) {
        instance.hosts.push(new HostGroup(hostName));
        instance.hosts.sort(function(a, b) {
            return a.name().localeCompare(b.name());
        });
    }

    instance.dataRow = new DataRow(instance.addHost, "application", instance.name);
    instance.addHostGroupRow = new DataRow(instance.addHost, "environment");
}
