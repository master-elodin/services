function Host(name) {
    var instance = this;

    instance.name = ko.observable(name);

    instance.dataRow = new DataRow(null, "host", instance.name, null, ",");

    instance.getData = function() {
        var getRandomNumber = function(upperBound) {
            return Math.floor(Math.random()*upperBound);
        };

        var createFakeService = function(serviceName) {
            var service = new Service({name: serviceName});
            var version = [1, getRandomNumber(5), getRandomNumber(10)].join(".");
            var possibleStatii = Object.keys(ServiceInstance.Status);
            var status = ServiceInstance.Status[possibleStatii[getRandomNumber(possibleStatii.length)]];
            service.addServiceInstance(instance.name(), new ServiceInstance({id: serviceName + instance.name(), version: version, status: status}));
            return service;
        }
        var results = [];
        for(var i = 0; i < getRandomNumber(25); i++) {
            results.push(createFakeService("service" + i));
        }
        return jQuery.Deferred().resolve(results);
    };
}
