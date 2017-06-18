function Host(loadingData) {
    var instance = this;

    instance.name = ko.observable(loadingData.name);

    instance.dataRow = new DataRow({dataType: "host", name: instance.name, separator: ",", onDelete: loadingData.onDelete, owner: instance});

    instance.getData = function() {
        var getRandomNumber = function(upperBound) {
            return Math.floor(Math.random()*upperBound);
        };

        var createFakeService = function(serviceName, subVersion) {
            var service = new Service({name: serviceName});
            var version = [1, getRandomNumber(5), getRandomNumber(10)].join(".");
            var possibleStatii = Object.keys(ServiceInstance.Status);
            var status = ServiceInstance.Status[possibleStatii[getRandomNumber(possibleStatii.length)]];
            service.addServiceInstance(instance.name(), new ServiceInstance({id: serviceName + instance.name() + subVersion, version: version, status: status}));
            return service;
        }
        var results = [];
        for(var i = 0; i < getRandomNumber(25); i++) {
            for(var k = 0; k < getRandomNumber(5); k++) {
                results.push(createFakeService("service" + i, k));
                if(k > 0) {
                    console.log("Creating extra service" + i);
                }
            }
        }
        return jQuery.Deferred().resolve(results);
    };
}
