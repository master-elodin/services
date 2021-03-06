function Service(creationData) {
    this.name = creationData.name;
    this.instancesByHost = ko.observable({});
    this.hostNames = ko.pureComputed(function() {
        return Object.keys(this.instancesByHost())
            .filter(function(hostName) {
                return this.getInstancesForHost(hostName).find(function(serviceInstance) {
                    return serviceInstance.isReal();
                });
            }, this).sort(sortStrings);
    }, this);
}

Service.SERVICE_INSTANCE_SORT = function(a, b) {
    return a.compareTo(b);
};

Service.prototype.getInstancesForHost = function(hostName) {
    if(!this.instancesByHost()[hostName]) {
        this.instancesByHost()[hostName] = [];
    }
    return this.instancesByHost()[hostName];
};

Service.prototype.allStoppedForHost = function(serviceInstance) {
    return this.getInstancesForHost(serviceInstance.hostName).every(function(serviceInstance) {
        return !serviceInstance.isActive();
    });
};

Service.prototype.getFirstInstanceForHost = function(hostName) {
    var serviceInstance = this.getInstancesForHost(hostName)[0];
    if(!serviceInstance) {
        serviceInstance = new ServiceInstance({id: "INSTANCE_NOT_FOUND", hostName: hostName, status: ServiceInstance.Status.NONE, version: "N/A"});
        this.addInstance(serviceInstance);
    }
    return serviceInstance;
}

Service.prototype.sortInstances = function() {
    Object.keys(this.instancesByHost()).forEach(function(hostName) {
        this.getInstancesForHost(hostName).sort(Service.SERVICE_INSTANCE_SORT);
    }, this);
    this.instancesByHost.valueHasMutated();
}

Service.prototype.addInstance = function(newServiceInstance) {
    var existingInstances = this.getInstancesForHost(newServiceInstance.hostName);
    var existingServiceInstance = existingInstances.find(function(serviceInstance) {
        return newServiceInstance.idWithoutStatus === serviceInstance.idWithoutStatus;
    });
    if(existingServiceInstance) {
        existingServiceInstance.id = newServiceInstance.id;
        existingServiceInstance.status(newServiceInstance.status());
    } else {
        existingInstances.push(newServiceInstance);
        existingInstances.sort(Service.SERVICE_INSTANCE_SORT);
    }
    newServiceInstance.parent = this;
    this.instancesByHost.valueHasMutated();
}

Service.prototype.merge = function(otherService) {
    var service = this;
    Object.keys(otherService.instancesByHost()).forEach(function(hostName) {
        otherService.instancesByHost()[hostName].forEach(function(serviceInstance) {
            service.addInstance(serviceInstance);
        });
    });
};

Service.prototype.getAllInstances = function() {
    var serviceInstances = [];
    Object.keys(this.instancesByHost()).forEach(function(hostName) {
        Array.prototype.push.apply(serviceInstances, this.instancesByHost()[hostName]);
    }, this);
    return serviceInstances;
};

Service.prototype.getInstanceWithoutStatus = function(idWithoutStatus) {
    return this.getAllInstances().find(function(serviceInstance) {
        return serviceInstance.idWithoutStatus === idWithoutStatus;
    });
}