describe("Service", function() {

    var HOST_NAME = "host1";

    var service;

    beforeEach(function() {
        service = new Service({name: "service"});
    });

    afterEach(function() {
        service = null;
    });

    describe("creation", function() {

        it("should set name if given name", function() {
            expect(service.name).toBe("service");
        });
    });

    describe("merge", function() {

        var otherService;

        beforeEach(function() {
            otherService = new Service({name: "service"});
        });

        afterEach(function() {
            otherService = null;
        });

        it("should add each service instance of other", function() {
            spyOn(service, "addInstance").and.stub();

            var serviceInstance = new ServiceInstance({id: "service-instance", version: "1.0.0", status: ServiceInstance.Status.RUNNING, hostName: "host"});
            otherService.addInstance(serviceInstance);

            service.merge(otherService);

            expect(service.addInstance).toHaveBeenCalledWith(serviceInstance);
        });
    });

    describe("addInstance", function() {

        it("should add service instance to correct host list if not already existing", function() {
            var serviceInstance = new ServiceInstance({id: "service-instance", version: "1.0.0", status: ServiceInstance.Status.RUNNING, hostName: HOST_NAME});
            service.addInstance(serviceInstance);

            expect(service.getInstancesForHost(HOST_NAME)[0]).toBe(serviceInstance);
        });

        it("should update status of service instance if already existing with same ID", function() {
            service.addInstance(new ServiceInstance({id: "service-instance", version: "1.0.0", status: ServiceInstance.Status.RUNNING, hostName: HOST_NAME}));

            expect(service.getInstancesForHost(HOST_NAME)[0].status()).toBe(ServiceInstance.Status.RUNNING);

            service.addInstance(new ServiceInstance({id: "service-instance", version: "1.0.0", status: ServiceInstance.Status.STOPPING, hostName: HOST_NAME}));

            expect(service.getInstancesForHost(HOST_NAME)[0].status()).toBe(ServiceInstance.Status.STOPPING);
        });

        it("should ignore status in the ID and update ID to include status", function() {
            service.addInstance(new ServiceInstance({id: "GROUP;SERVICE;1_0_0;host1;Up", version: "1.0.0", status: ServiceInstance.Status.RUNNING, hostName: HOST_NAME}));

            expect(service.getInstancesForHost(HOST_NAME)[0].status()).toBe(ServiceInstance.Status.RUNNING);

            service.addInstance(new ServiceInstance({id: "GROUP;SERVICE;1_0_0;host1;Stopping", version: "1.0.0", status: ServiceInstance.Status.STOPPING, hostName: HOST_NAME}));

            expect(service.getInstancesForHost(HOST_NAME)[0].status()).toBe(ServiceInstance.Status.STOPPING);
            expect(service.getInstancesForHost(HOST_NAME)[0].id).toBe("GROUP;SERVICE;1_0_0;host1;Stopping");
        });

        it("should add self as parent to instance", function() {
            var serviceInstance = new ServiceInstance({id: "GROUP;SERVICE;1_0_0;host1;Up", version: "1.0.0", status: ServiceInstance.Status.RUNNING, hostName: HOST_NAME});
            service.addInstance(serviceInstance);

            expect(serviceInstance.parent).toBe(service);
        });
    });

    describe("getInstancesForHost", function() {

        it("should return empty list if not found for host", function() {
            expect(service.getInstancesForHost(HOST_NAME).length).toBe(0);
        });

        it("should return existing list if found for host", function() {
            var instance = new ServiceInstance({id: "service-instance", version: "1.0.0", status: ServiceInstance.Status.RUNNING});
            service.instancesByHost()[HOST_NAME] = [instance];

            expect(service.getInstancesForHost(HOST_NAME).length).toBe(1);
            expect(service.getInstancesForHost(HOST_NAME)[0]).toBe(instance);
        });
    });

    describe("getFirstInstanceForHost", function() {

        it("should return the first instance for the host", function() {
            var instance = new ServiceInstance({id: "service-instance;", version: "1.0.0", status: ServiceInstance.Status.RUNNING});
            service.instancesByHost()[HOST_NAME] = [instance];

            expect(service.getFirstInstanceForHost(HOST_NAME)).toBe(instance);
        });

        it("should return UNKNOWN instance if no data found for host", function() {
            expect(service.getFirstInstanceForHost("other host").id).toBe("INSTANCE_NOT_FOUND");
            expect(service.getFirstInstanceForHost("other host").hostName).toBe("other host");
            expect(service.getFirstInstanceForHost("other host").status()).toBe(ServiceInstance.Status.NONE);
        });
    });

    describe("getAllInstances", function() {

        it("should return all instances", function() {
            var serviceInstance1 = new ServiceInstance({id: "service-instance1;", version: "1.0.0", status: ServiceInstance.Status.RUNNING, hostName: "host1"});
            service.addInstance(serviceInstance1);
            var serviceInstance2 = new ServiceInstance({id: "service-instance2;", version: "1.0.0", status: ServiceInstance.Status.RUNNING, hostName: "host2"});
            service.addInstance(serviceInstance2);
            var serviceInstance3 = new ServiceInstance({id: "service-instance3;", version: "1.1.0", status: ServiceInstance.Status.STOPPING, hostName: "host1"});
            service.addInstance(serviceInstance3);

            expect(service.getAllInstances().length).toBe(3);
        });
    });

    describe("allStoppedForHost", function() {

        it("should return true if all service instances STOPPED for given host", function() {
            var serviceInstance1 = new ServiceInstance({id: "service-instance1", version: "1.0.0", status: ServiceInstance.Status.STOPPED, hostName: "host1"});
            service.addInstance(serviceInstance1);
            var serviceInstance2 = new ServiceInstance({id: "service-instance2", version: "1.0.0", status: ServiceInstance.Status.STOPPED, hostName: "host1"});
            service.addInstance(serviceInstance2);

            expect(service.allStoppedForHost(serviceInstance1)).toBe(true);
        });

        it("should return false if all service instances not STOPPED for given host", function() {
            var serviceInstance1 = new ServiceInstance({id: "service-instance1;", version: "1.0.0", status: ServiceInstance.Status.STOPPING, hostName: "host1"});
            service.addInstance(serviceInstance1);
            var serviceInstance2 = new ServiceInstance({id: "service-instance2;", version: "1.0.0", status: ServiceInstance.Status.STOPPED, hostName: "host1"});
            service.addInstance(serviceInstance2);

            expect(service.allStoppedForHost(serviceInstance1)).toBe(false);
        });
    });

    describe("hostNames", function() {

        it("should return keys from instancesByHost if any service instance on host is real", function() {
            expect(service.hostNames().length).toBe(0);

            service.addInstance(new ServiceInstance({id: "service-instance1", version: "1.0.0", status: ServiceInstance.Status.STOPPING, hostName: "host1"}));

            expect(service.hostNames().length).toBe(1);
            expect(service.hostNames()[0]).toBe("host1");

            service.addInstance(new ServiceInstance({id: "service-instance2", version: "1.0.0", status: ServiceInstance.Status.NONE, hostName: "host2"}));

            expect(service.hostNames().length).toBe(1);
            expect(service.hostNames()[0]).toBe("host1");

            service.addInstance(new ServiceInstance({id: "service-instance3", version: "1.0.0", status: ServiceInstance.Status.STOPPING, hostName: "host2"}));

            expect(service.hostNames().length).toBe(2);
            expect(service.hostNames()[0]).toBe("host1");
            expect(service.hostNames()[1]).toBe("host2");
        });
    });

    describe("getInstanceWithoutStatus", function() {

        it("should return instance for given idWithoutStatus", function() {
            var serviceInstance1 = new ServiceInstance({id: "GROUP;SERVICE;1_0_0;host1;Up", version: "1.0.0", status: ServiceInstance.Status.RUNNING, hostName: HOST_NAME});
            var serviceInstance2 = new ServiceInstance({id: "GROUP;SERVICE;1_1_0;host1;Stopping", version: "1.1.0", status: ServiceInstance.Status.RUNNING, hostName: HOST_NAME});
            service.addInstance(serviceInstance1);
            service.addInstance(serviceInstance2);

            expect(service.getInstanceWithoutStatus(serviceInstance2.idWithoutStatus)).toBe(serviceInstance2);
        });
    });

    describe("sortInstances", function() {

        it("should sort instances for all hosts using their comparison function", function() {
            var serviceInstance1 = new ServiceInstance({id: "GROUP;SERVICE;1_0_0;host1;Up", version: "1.0.0", status: ServiceInstance.Status.RUNNING, hostName: "host1"});
            var serviceInstance2 = new ServiceInstance({id: "GROUP;SERVICE;1_1_0;host1;Stopping", version: "1.1.0", status: ServiceInstance.Status.RUNNING, hostName: "host1"});
            var serviceInstance3 = new ServiceInstance({id: "GROUP;SERVICE;1_0_0;host2;Up", version: "1.0.0", status: ServiceInstance.Status.RUNNING, hostName: "host2"});
            var serviceInstance4 = new ServiceInstance({id: "GROUP;SERVICE;1_1_0;host2;Stopping", version: "1.1.0", status: ServiceInstance.Status.RUNNING, hostName: "host2"});
            service.instancesByHost()["host1"] = [serviceInstance1, serviceInstance2];
            service.instancesByHost()["host2"] = [serviceInstance3, serviceInstance4];

            service.sortInstances();

            expect(service.getInstancesForHost("host1")[0]).toBe(serviceInstance2);
            expect(service.getInstancesForHost("host1")[1]).toBe(serviceInstance1);
            expect(service.getInstancesForHost("host2")[0]).toBe(serviceInstance4);
            expect(service.getInstancesForHost("host2")[1]).toBe(serviceInstance3);
        });
    });
});