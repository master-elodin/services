describe("A Service", function() {

    var service;

    beforeEach(function() {
        service = new Service({name: "service"});
    });

    afterEach(function() {
        service = null;
    });

    describe("creation", function() {

        it("should have only 4 letters in displayName per name segment if split by capital letters and more than 20 characters", function() {
            service = new Service({name: "SomethingWithAVeryLongNamingConvention"});

            expect(service.displayName()).toBe("SomeWithAVeryLongNamiConv");
        });

        it("should not shorten if less than 21 characters", function() {
            service = new Service({name: "SomethingWithAVeryLo"});

            expect(service.displayName()).toBe("SomethingWithAVeryLo");
        });

        it("should have only 4 letters in displayName per name segment if split by non-letter characters and more than 20 characters", function() {
            service = new Service({name: "something-with_a-Very-long_NamingConvention"});

            expect(service.displayName()).toBe("SomeWithAVeryLongNamiConv");
        });
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
    });
});