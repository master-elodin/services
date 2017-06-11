function HostGroup(name) {
    var instance = this;

    instance.name = ko.observable(name);
    instance.hosts = ko.observableArray();

    instance.addHost = function(hostName) {
        instance.hosts.push(new Host(hostName));
        instance.hosts.sort(function(a, b) {
            return a.name().localeCompare(b.name());
        });
    };
}
