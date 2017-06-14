function HostGroup(loadingData) {
    var instance = this;

    instance.parent = loadingData.parent;
    instance.page = loadingData.page;
    instance.name = ko.observable(loadingData.name);
    instance.hosts = ko.observableArray();
    instance.services = ko.observableArray();

    instance.addHost = function(hostName) {
        var host = new Host(hostName);
        instance.hosts.push(host);
        instance.hosts.sort(function(a, b) {
            return a.name().localeCompare(b.name());
        });
        return host;
    };

    instance.addService = function(newService) {
        var existingService = instance.services().find(function(service) {
            return service.name === newService.name;
        });
        if(existingService) {
            existingService.merge(newService);
        } else {
            instance.services.push(newService);
            instance.services.sort(function(a, b) {
                return a.name.localeCompare(b.name);
            });
        }
    };

    instance.isActive = ko.observable(false);
    instance.select = function() {
        instance.isActive(!instance.isActive());
        if(instance.isActive()) {
            instance.page.activateItem(instance);
        }
        instance.page.save();
    };

    instance.dataRow = new DataRow(null, "host-group", instance.name, instance.select, ",", ", {");
    instance.addDataRow = new DataRow(instance.addHost, "host");
}
