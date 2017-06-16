function HostGroup(loadingData) {
    var instance = this;

    instance.parent = loadingData.parent;
    instance.page = loadingData.page;
    instance.name = ko.observable(loadingData.name);
    instance.hosts = ko.observableArray();
    instance.services = ko.observableArray();

    instance.addHost = function(hostName) {
        var host = new Host(hostName);
        instance.hosts.push(host);
        instance.hosts.sort(function(a, b) {
            return a.name().localeCompare(b.name());
        });
        return host;
    };

    instance.addService = function(newService) {
        if(newService.name()) {
            var existingService = instance.getService(newService.name());
            if(existingService) {
                existingService.merge(newService);
            } else {
                instance.services.push(newService);
                instance.services.sort(function(a, b) {
                    return a.name().localeCompare(b.name());
                });
            }
        }
    };

    instance.isActive = ko.observable(false);
    instance.select = function() {
        instance.isActive(!instance.isActive());
        if(instance.isActive()) {
            instance.page.activateItem(instance);
        }
        instance.page.save();
    };

    instance.dataRow = new DataRow(null, "host-group", instance.name, instance.select, ",", ", {");
    instance.addDataRow = new DataRow(instance.addHost, "host");

    instance.getService = function(serviceName) {
        return instance.services().find(function(service) {
            return service.name() === serviceName;
        });
    };

    instance.loadData = function() {
        var loadCompleted = jQuery.Deferred();
        var numHosts = instance.hosts().length;
        var numCompleted = 0;
        var hostNames = instance.hosts().map(function(host) {
            return host.name();
        });
        console.log(instance.hosts());
        console.log("Starting to load data for " + instance.parent.name() + "-" + instance.name() + " with hosts " + hostNames);
        if(instance.hosts().length === 0) {
            loadCompleted.resolve();
        } else {
            instance.hosts().forEach(function(host) {
                console.log("Will request for host " + host.name());
                host.getData().then(function(servicesDataForHost) {
                    // clear all existing service statuses first
                    instance.services().forEach(function(service) {
                        service.getInstancesForHost(host.name()).forEach(function(serviceInstance) {
                            serviceInstance.status(ServiceInstance.Status.UNKNOWN);
                        });
                    });
                    servicesDataForHost.forEach(instance.addService);
                    if(++numCompleted === numHosts) {
                        console.log("Finished loading data for " + instance.parent.name() + "-" + instance.name());
                        loadCompleted.resolve();
                    }
                });
            });
        }
        return loadCompleted;
    };

    instance.getServiceHealths = ko.pureComputed(function() {
        var serviceHealths = [];
        instance.services().forEach(function(service) {
            var serviceHealth = new ServiceHealth({name: service.name()});
            instance.hosts().forEach(function(host) {
                var serviceInstance = service.getRunningOrHighestVersionInstance(host.name());
                serviceHealth.addHostHealth(new HostHealth({hostName: host.name(), 
                    status: serviceInstance.status(), 
                    id: serviceInstance.id()
                }));
            });
            serviceHealths.push(serviceHealth);
        });
        return serviceHealths;
    });
}
