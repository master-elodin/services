function Service(loadingData) {
    var instance = this;

    instance.name = ko.observable(loadingData.name);
    var displayName = loadingData.name;
    if(loadingData.name.length > 20) {
        var nameParts = loadingData.name.split(/(?=[A-Z])|(?=\W)|(?=_)/);
        displayName = nameParts.map(function(namePart) {
            namePart = namePart.replace(/(\W)|(_)/, "").substring(0, 4);
            return namePart.charAt(0).toUpperCase() + namePart.slice(1);
        }).join("");
    }
    instance.displayName = ko.observable(displayName);
    instance.instancesByHost = ko.observable({});

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
        loadingData.instancesByHost[host].forEach(function(serviceInstanceData) {
            instance.addServiceInstance(host, new ServiceInstance(serviceInstanceData));
        });
    });

    instance.getRunningOrHighestVersionInstance = function(hostName) {
        // versions are already sorted, so just grab the first one
        return instance.getInstancesForHost(hostName)[0] || Service.UNKNOWN_INSTANCE;
    }
}
Service.UNKNOWN_INSTANCE = new ServiceInstance({id: "UNKNOWN", version: "0.0.0"});
