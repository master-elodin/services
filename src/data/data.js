function Data() {

}

Data.getDataForHosts = function(hostNameList) {

    var getRandomNumber = function(upperBound) {
        return Math.floor(Math.random()*upperBound);
    };

    var createFakeService = function(serviceName, subVersion, hostName) {
        var service = new Service({name: serviceName});
        var version = [1, getRandomNumber(5), getRandomNumber(10)].join(".");
        var possibleStatii = Object.keys(ServiceInstance.Status);
        var status = ServiceInstance.Status[possibleStatii[getRandomNumber(possibleStatii.length)]];
        service.addInstance(new ServiceInstance({id: serviceName + hostName + subVersion, version: version, status: status, hostName: hostName}));
        return service;
    }

    var data = [];
    hostNameList.forEach(function(hostName) {
        var results = [];
        for(var i = 0; i < getRandomNumber(25); i++) {
            for(var k = 0; k < getRandomNumber(5); k++) {
                data.push(createFakeService("service" + i, k, hostName));
            }
        }
    });

    return jQuery.Deferred().resolve(data);
}