function HostGroup(id) {
    var instance = this;

    instance.id = id;
    instance.services = [];

    instance.addService = function(newService) {
        var existingService = instance.services.find(function(service) {
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
}
