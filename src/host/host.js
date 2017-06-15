function Host(name) {
    var instance = this;

    instance.name = ko.observable(name);

    instance.dataRow = new DataRow(null, "host", instance.name, null, ",");

    instance.getData = function() {
        var createFakeService = function(serviceName) {
            var service = new Service(serviceName);
            service.addServiceInstance(instance.name(), new ServiceInstance({id: serviceName + instance.name(), version:"1.0.0"}));
            return service;
        }
        return jQuery.Deferred().resolve([createFakeService("service1"), createFakeService("service2")]);
    };
}
