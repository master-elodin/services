function Service(name) {
    var instance = this;

    instance.name = name;
    instance.instancesByHost = {};

    instance.addServiceInstance = function(hostName, serviceInstance) {
        if(!instance.instancesByHost[hostName]) {
            instance.instancesByHost[hostName] = [];
        }
        // find an existing one with the same ID
        var foundExisting = false;
        for(var i = 0; i < instance.instancesByHost[hostName].length; i++) {
            if(instance.instancesByHost[hostName][i].id === serviceInstance.id) {
                instance.instancesByHost[hostName][i] = serviceInstance;
                foundExisting = true;
                break;
            }
        }
        if(!foundExisting) {
            instance.instancesByHost[hostName].push(serviceInstance);
        }
        instance.instancesByHost[hostName].sort(function(a, b) {
            // sort in descending order by version (major.minor.patch)
            var partsA = a.version.split(".");
            var partsB = b.version.split(".");
            for(var i = 0; i < partsA.length; i++) {
                var diff = parseInt(partsB[i]) - parseInt(partsA[i]);
                if(diff !== 0) {
                    return diff;
                }
            }
            return 0;
        });
    }
}
