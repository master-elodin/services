function HostGroup(id) {
    var instance = this;

    instance.id = id;
    instance.services = [];

    instance.addService = function(service) {
        instance.services.push(service);

        instance.services.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        });
    }
}