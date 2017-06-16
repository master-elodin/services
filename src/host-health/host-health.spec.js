describe("HostHealth", function() {

    var hostHealth;

    beforeEach(function() {
        hostHealth = new HostHealth({});
    });

    afterEach(function() {
        hostHealth = null;
    });

    describe("creation", function() {

        it("should set host name", function() {
            hostHealth = new HostHealth({hostName: "host1"});

            expect(hostHealth.hostName()).toBe("host1");
        });

        it("should set status as unknown if not given", function() {
            hostHealth = new HostHealth({});

            expect(hostHealth.status()).toBe(ServiceInstance.Status.UNKNOWN);
        });

        it("should set status if given", function() {
            hostHealth = new HostHealth({status: ServiceInstance.Status.STARTING});

            expect(hostHealth.status()).toBe(ServiceInstance.Status.STARTING);
        });
    });

    describe("getHealthIcon", function() {

        it("should return Unknown icon if UNKNOWN", function() {
            hostHealth.status(ServiceInstance.Status.UNKNOWN);

            expect(hostHealth.getHealthIcon()).toBe("fa-question-circle-o");
        });
    });

    describe("getHealthColorClass", function() {

        it("should return Unknown color if UNKNOWN", function() {
            hostHealth.status(ServiceInstance.Status.UNKNOWN);

            expect(hostHealth.getHealthColorClass()).toBe("host-health__icon--unknown");
        });
    });
});