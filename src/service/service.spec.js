describe("A Service", function() {

    var service;

    beforeEach(function() {
        service = new Service({name: "service"});
    });

    afterEach(function() {
        service = null;
    });

    describe("addServiceInstance", function() {

        it("should add service instance to appropriate host", function() {
            service.addServiceInstance("host1", new ServiceInstance({id: "id1", version: "1.21.0"}));
            service.addServiceInstance("host1", new ServiceInstance({id: "id2", version: "1.22.0"}));
            service.addServiceInstance("host2", new ServiceInstance({id: "id3", version: "1.21.0"}));

            expect(service.instancesByHost()["host1"].length).toBe(2);
            expect(service.instancesByHost()["host2"].length).toBe(1);
        });

        it("should override rather than add service instance if it already exists for given id", function() {
            service.addServiceInstance("host1", new ServiceInstance({id: "id1", version: "1.21.0"}));
            service.addServiceInstance("host1", new ServiceInstance({id: "id1", version: "1.22.0"}));

            expect(service.instancesByHost()["host1"][0].version()).toBe("1.22.0");

            // re-add the old version
            service.addServiceInstance("host1", new ServiceInstance({id: "id1", version: "1.23.0"}));

            expect(service.instancesByHost()["host1"][0].version()).toBe("1.23.0");
        });

        it("should sort service instances on the same host based on descending version", function() {
            service.addServiceInstance("host1", new ServiceInstance({id: "id1", version: "1.21.0"}));
            service.addServiceInstance("host1", new ServiceInstance({id: "id2", version: "1.22.0"}));
            service.addServiceInstance("host2", new ServiceInstance({id: "id3", version: "2.0.0"}));
            service.addServiceInstance("host2", new ServiceInstance({id: "id4", version: "1.20.20"}));

            expect(service.instancesByHost()["host1"][0].id()).toBe("id2");
            expect(service.instancesByHost()["host1"][1].id()).toBe("id1");
            expect(service.instancesByHost()["host2"][0].id()).toBe("id3");
            expect(service.instancesByHost()["host2"][1].id()).toBe("id4");
        });
    });

    describe("merge", function() {

        it("should add all service instances from other service", function() {
            service.addServiceInstance("host1", new ServiceInstance({id: "id1", version: "1.21.0"}));
            service.addServiceInstance("host1", new ServiceInstance({id: "id2", version: "1.22.0"}));

            var otherService = new Service({name: "service"});
            otherService.addServiceInstance("host2", new ServiceInstance({id: "id3", version: "2.0.0"}));
            otherService.addServiceInstance("host2", new ServiceInstance({id: "id4", version: "1.20.20"}));

            service.merge(otherService);

            expect(service.instancesByHost()["host1"][0].id()).toBe("id2");
            expect(service.instancesByHost()["host1"][1].id()).toBe("id1");
            expect(service.instancesByHost()["host2"][0].id()).toBe("id3");
            expect(service.instancesByHost()["host2"][1].id()).toBe("id4");
        });
    });

    describe("getRunningOrHighestVersionInstance", function() {

        var HOST_NAME = "host1";

        it("should return UNKNOWN instance if no data found for given host name", function() {
            expect(service.getRunningOrHighestVersionInstance(HOST_NAME)).toBe(Service.UNKNOWN_INSTANCE);
        })

        it("should return highest version instance if no instances RUNNING for given host", function() {
            var serviceInstance1 = new ServiceInstance({id: "id1", version: "1.21.0"});
            service.addServiceInstance(HOST_NAME, serviceInstance1);
            var serviceInstance2 = new ServiceInstance({id: "id2", version: "1.22.0"});
            service.addServiceInstance(HOST_NAME, serviceInstance2);
            var serviceInstance3 = new ServiceInstance({id: "id3", version: "1.22.1"});
            service.addServiceInstance(HOST_NAME, serviceInstance3);

            expect(service.getRunningOrHighestVersionInstance(HOST_NAME)).toBe(serviceInstance3);
        })

        it("should return running version instance", function() {
            var serviceInstance1 = new ServiceInstance({id: "id1", version: "1.21.0", status: ServiceInstance.Status.RUNNING});
            service.addServiceInstance(HOST_NAME, serviceInstance1);
            var serviceInstance2 = new ServiceInstance({id: "id2", version: "1.22.0"});
            service.addServiceInstance(HOST_NAME, serviceInstance2);
            var serviceInstance3 = new ServiceInstance({id: "id3", version: "1.22.1"});
            service.addServiceInstance(HOST_NAME, serviceInstance3);

            expect(service.getRunningOrHighestVersionInstance(HOST_NAME)).toBe(serviceInstance1);
        })
    });

    describe("getInstancesPerHost", function() {

        var HOST_NAME = "host1";
        var serviceInstance1;
        var serviceInstance2;
        var serviceInstance3;

        beforeEach(function() {
            serviceInstance1 = new ServiceInstance({id: "id1", version: "1.21.0"});
            service.addServiceInstance(HOST_NAME, serviceInstance1);
            serviceInstance2 = new ServiceInstance({id: "id2", version: "1.22.0", status: ServiceInstance.Status.RUNNING});
            service.addServiceInstance(HOST_NAME, serviceInstance2);
            serviceInstance3 = new ServiceInstance({id: "id3", version: "1.22.1"});
            service.addServiceInstance(HOST_NAME, serviceInstance3);
        });

        afterEach(function() {
            serviceInstance1 = null;
            serviceInstance2 = null;
            serviceInstance3 = null;
        });

        it("should sort instances based on version (descending) with running version first", function() {
            expect(service.getInstancesPerHost()[0].serviceInstances[0]).toBe(serviceInstance2);
            expect(service.getInstancesPerHost()[0].serviceInstances[1]).toBe(serviceInstance3);
            expect(service.getInstancesPerHost()[0].serviceInstances[2]).toBe(serviceInstance1);
        });

        it("should set allStopped=false if any running", function() {
            expect(service.getInstancesPerHost()[0].allStopped).toBe(false);
        });

        it("should set allStopped=false if any stopping", function() {
            serviceInstance2.status(ServiceInstance.Status.STOPPING);

            expect(service.getInstancesPerHost()[0].allStopped).toBe(false);
        });

        it("should set allStopped=true if all stopped or unknown", function() {
            serviceInstance2.status(ServiceInstance.Status.STOPPED);

            expect(service.getInstancesPerHost()[0].allStopped).toBe(true);
        });
    });
});