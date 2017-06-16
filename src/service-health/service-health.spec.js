describe("ServiceHealth", function() {

    var serviceHealth;

    beforeEach(function() {
        serviceHealth = new ServiceHealth({name: "service"});
    });

    afterEach(function() {
        serviceHealth = null;
    });

    describe("creation", function() {

        it("should have only 4 letters in displayName per name segment if split by capital letters and more than 20 characters", function() {
            serviceHealth = new ServiceHealth({name: "SomethingWithAVeryLongNamingConvention"});

            expect(serviceHealth.name()).toBe("SomeWithAVeryLongNamiConv");
        });

        it("should not shorten if less than 21 characters", function() {
            serviceHealth = new ServiceHealth({name: "SomethingWithAVeryLo"});

            expect(serviceHealth.name()).toBe("SomethingWithAVeryLo");
        });

        it("should have only 4 letters in displayName per name segment if split by non-letter characters and more than 20 characters", function() {
            serviceHealth = new ServiceHealth({name: "something-with_a-Very-long_NamingConvention"});

            expect(serviceHealth.name()).toBe("SomeWithAVeryLongNamiConv");
        });
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