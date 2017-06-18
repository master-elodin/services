function ServiceController(loadingData) {
    var instance = this;

    instance.startStopUnlocked = ko.observable(false);
    instance.toggleStartStop = createToggle(instance.startStopUnlocked);

    instance.activeHostGroup = loadingData.activeHostGroup;

    instance.serviceInstancesPerHost = ko.observableArray();
    var sortServiceInstance = function(serviceInstance) {
        serviceInstance.data.sort(function(a, b) {
            return a.hostName.localeCompare(b.hostName);
        });
    }
    instance.addSelected = function() {
        // TODO: don't duplicate services
        instance.serviceInstancesPerHost.push.apply(instance.serviceInstancesPerHost, instance.activeHostGroup().getServiceHealths().map(function(serviceHealth) {
            var selected = {name: serviceHealth.name()};
            selected.data = serviceHealth.hostHealths().filter(function(hostHealth) {
                return hostHealth.selected() && hostHealth.isReal();
            }).map(function(selectedHostHealth) {
                return {id: selectedHostHealth.id(), version: selectedHostHealth.version(), hostName: selectedHostHealth.hostName()};
            });
            sortServiceInstance(selected);
            return selected;
        }).filter(function(serviceInstance) {
            var existingServiceInstance = instance.serviceInstancesPerHost().find(function(existingServiceInstance) {
                return existingServiceInstance.name === serviceInstance.name;
            });
            // add to existing data before removing
            if(existingServiceInstance) {
                serviceInstance.data.forEach(function(data) {
                    var dataExists = !!existingServiceInstance.data.find(function(existingData) {
                        return data.id === existingData.id; 
                    });
                    if(!dataExists) {
                        existingServiceInstance.data.push(data);
                    }
                });
                sortServiceInstance(existingServiceInstance);
            }
            return serviceInstance.data.length > 0 && !existingServiceInstance;
        }));
        instance.activeHostGroup().getServiceHealths().forEach(function(serviceHealth) {
            serviceHealth.hostHealths().forEach(function(hostHealth) {
                hostHealth.selected(false);
            });
        });
    }
}