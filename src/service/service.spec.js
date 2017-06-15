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
            service.addServiceInstance("host1", new ServiceInstance({id: "id1", version: "1.21.0"}));

            expect(service.instancesByHost()["host1"][0].version()).toBe("1.21.0");
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
});