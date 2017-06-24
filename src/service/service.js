function Service(creationData) {
    this.name = creationData.name;
    this.instancesByHost = ko.observable({});
}

Service.prototype.getInstancesForHost = function(hostName) {
    if(!this.instancesByHost()[hostName]) {
        this.instancesByHost()[hostName] = [];
    }
    return this.instancesByHost()[hostName];
};

Service.prototype.getFirstInstanceForHost = function(hostName) {
    return this.getInstancesForHost(hostName)[0] || new ServiceInstance({id: "INSTANCE_NOT_FOUND", hostName: hostName, status: ServiceInstance.Status.NONE, version: "N/A"});
}

Service.prototype.addInstance = function(newServiceInstance) {
    var existingInstances = this.getInstancesForHost(newServiceInstance.hostName);
    var existingServiceInstance = existingInstances.find(function(serviceInstance) {
        return newServiceInstance.id === serviceInstance.id;
    });
    if(existingServiceInstance) {
        existingServiceInstance.status(newServiceInstance.status());
    } else {
        existingInstances.push(newServiceInstance);
        existingInstances.sort(function(a, b) {
            return a.compareTo(b);
        });
    }
}

Service.prototype.merge = function(otherService) {
    var service = this;
    Object.keys(otherService.instancesByHost()).forEach(function(hostName) {
        otherService.instancesByHost()[hostName].forEach(function(serviceInstance) {
            service.addInstance(serviceInstance);
        });
    });
};
