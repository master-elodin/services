function Service(loadingData) {
    var instance = this;

    instance.name = ko.observable(loadingData.name);
    instance.instancesByHost = ko.observable({});
    instance.isActive = ko.observable(false);

    instance.getInstancesForHost = function(hostName) {
        if(!instance.instancesByHost()[hostName]) {
            instance.instancesByHost()[hostName] = [];
        }
        return instance.instancesByHost()[hostName];
    };

    instance.addServiceInstance = function(hostName, serviceInstance) {
        var instancesForHost = instance.getInstancesForHost(hostName);
        // find an existing one with the same ID
        var foundExisting = false;
        for(var i = 0; i < instancesForHost.length; i++) {
            if(instancesForHost[i].id() === serviceInstance.id()) {
                instancesForHost[i] = serviceInstance;
                foundExisting = true;
                break;
            }
        }
        if(!foundExisting) {
            instancesForHost.push(serviceInstance);
        }
        instancesForHost.sort(function(a, b) {
            // sort in descending order by version (major.minor.patch)
            var partsA = a.version().split(".");
            var partsB = b.version().split(".");
            for(var i = 0; i < partsA.length; i++) {
                var diff = parseInt(partsB[i]) - parseInt(partsA[i]);
                if(diff !== 0) {
                    return diff;
                }
            }
            return 0;
        });
    };
    // if given hostName and serviceInstance in loadingData, go ahead and add that
    if(loadingData.hostName && loadingData.serviceInstance) {
        instance.addServiceInstance(loadingData.hostName, loadingData.serviceInstance)
    }

    instance.merge = function(otherService) {
        // add each service from each host on otherService
        Object.keys(otherService.instancesByHost()).forEach(function(host) {
            otherService.getInstancesForHost(host).forEach(function(serviceInstance) {
                instance.addServiceInstance(host, serviceInstance);
            });
        });
    };

    Object.keys(loadingData.instancesByHost || {}).forEach(function(host) {
        if(host)
        loadingData.instancesByHost[host].forEach(function(serviceInstanceData) {
            instance.addServiceInstance(host, new ServiceInstance(serviceInstanceData));
        });
    });

    instance.getRunningOrHighestVersionInstance = function(hostName) {
        var serviceInstances = instance.getInstancesForHost(hostName);
        var runningVersion = serviceInstances.find(function(serviceInstance) {
            return serviceInstance.isRunning();
        });
        // versions are already sorted, so just grab the first one
        return runningVersion || serviceInstances[0] || Service.UNKNOWN_INSTANCE;
    }

    instance.getInstancesPerHost = ko.pureComputed(function() {
        return Object.keys(instance.instancesByHost()).map(function(hostName) {
            var serviceInstances = instance.instancesByHost()[hostName];
            var runningOrHighestVersion = instance.getRunningOrHighestVersionInstance(hostName);
            // move running version to the front of the list
            serviceInstances.splice(serviceInstances.indexOf(runningOrHighestVersion), 1);
            serviceInstances.unshift(runningOrHighestVersion)
            var allStopped = serviceInstances.every(function(serviceInstance) {
                return serviceInstance.isStopped() || serviceInstance.hasNoStatus();
            });
            return { hostName: hostName, serviceInstances: serviceInstances, allStopped: allStopped};
        });
    });
}
Service.UNKNOWN_INSTANCE = new ServiceInstance({id: "service-not-found", version: "0.0.0", status: ServiceInstance.Status.NONE});
