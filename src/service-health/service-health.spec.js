describe("ServiceHealth", function() {

    var serviceHealth;

    beforeEach(function() {
        serviceHealth = new ServiceHealth({name: "service"});
    });

    afterEach(function() {
        serviceHealth = null;
    });

    describe("addHostHealth", function() {

        it("should set host healths", function() {
            var hostHealth1 = new HostHealth({});
            var hostHealth2 = new HostHealth({status: ServiceInstance.Status.RUNNING});

            serviceHealth.addHostHealth(hostHealth1);
            serviceHealth.addHostHealth(hostHealth2);

            expect(serviceHealth.hostHealths()[0]).toBe(hostHealth1);
            expect(serviceHealth.hostHealths()[1]).toBe(hostHealth2);
        });
    });
});