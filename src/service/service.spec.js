describe("Service", function() {

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

        var HOST_NAME = "host1";

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
    });

    describe("getInstancesForHost", function() {

        var HOST_NAME = "host1";

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

        var HOST_NAME = "host1";

        it("should return the first instance for the host", function() {
            var instance = new ServiceInstance({id: "service-instance", version: "1.0.0", status: ServiceInstance.Status.RUNNING});
            service.instancesByHost()[HOST_NAME] = [instance];

            expect(service.getFirstInstanceForHost(HOST_NAME)).toBe(instance);
        });

        it("should return UNKNOWN instance if no data found for host", function() {
            expect(service.getFirstInstanceForHost("other host").id).toBe("INSTANCE_NOT_FOUND");
            expect(service.getFirstInstanceForHost("other host").hostName).toBe("other host");
            expect(service.getFirstInstanceForHost("other host").status()).toBe(ServiceInstance.Status.UNKNOWN);
        });
    });
});