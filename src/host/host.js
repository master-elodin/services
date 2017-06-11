function Host(name) {
    var instance = this;

    instance.name = ko.observable(name);
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

    instance.select = function() {

    };

    instance.dataRow = new DataRow(null, "host", instance.name, instance.select, ",");
}
