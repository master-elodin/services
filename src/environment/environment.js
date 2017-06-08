function Environment(name) {
    var instance = this;

    instance.name = name;

    instance.hosts = [];

    instance.addHost = function(hostName) {
        instance.hosts.push(hostName);
        instance.hosts.sort();
    }
}