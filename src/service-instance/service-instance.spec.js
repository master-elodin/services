describe("A Service Instance", function() {

    var serviceInstance;

    beforeEach(function() {
        serviceInstance = new ServiceInstance({id: "id", version: "1.2.1"});
    });

    afterEach(function() {
        serviceInstance = null;
    });

    it("should set ID on creation", function() {
        expect( serviceInstance.id ).toBe( "id" );
    });

    it("should set version on creation", function() {
        expect( serviceInstance.version ).toBe( "1.2.1" );
    });

    it("should be able to update status", function() {
        serviceInstance.status(ServiceInstance.Status.RUNNING);

        expect(serviceInstance.status()).toBe( ServiceInstance.Status.RUNNING );

        serviceInstance.status(ServiceInstance.Status.STOPPED);

        expect(serviceInstance.status()).toBe( ServiceInstance.Status.STOPPED );
    });

    describe("compareTo", function() {

        it("should return 0 if equal versions", function() {
            expect(serviceInstance.compareTo(new ServiceInstance({id: "id", version: serviceInstance.version})) === 0).toBe(true);
        });

        it("should return positive if lower major version than other", function() {
            expect(serviceInstance.compareTo(new ServiceInstance({id: "id", version: "2.2.0"})) > 0).toBe(true);
        });

        it("should return negative if higher major version than other", function() {
            expect(serviceInstance.compareTo(new ServiceInstance({id: "id", version: "0.2.0"})) < 0).toBe(true);
        });

        it("should return positive if lower minor version than other", function() {
            expect(serviceInstance.compareTo(new ServiceInstance({id: "id", version: "1.3.0"})) > 0).toBe(true);
        });

        it("should return negative if higher minor version than other", function() {
            expect(serviceInstance.compareTo(new ServiceInstance({id: "id", version: "1.1.0"})) < 0).toBe(true);
        });

        it("should return positive if lower patch version than other", function() {
            expect(serviceInstance.compareTo(new ServiceInstance({id: "id", version: "1.2.2"})) > 0).toBe(true);
        });

        it("should return negative if higher patch version than other", function() {
            expect(serviceInstance.compareTo(new ServiceInstance({id: "id", version: "1.2.0"})) < 0).toBe(true);
        });

        it("should return negative if status not NONE and other status is NONE", function() {
            serviceInstance.status(ServiceInstance.Status.RUNNING);
            expect(serviceInstance.compareTo(new ServiceInstance({id: "INSTANCE_NOT_FOUND", status: ServiceInstance.Status.NONE}))).toBe(-1);
        });

        it("should return positive if status NONE and other status is not NONE", function() {
            serviceInstance.status(ServiceInstance.Status.NONE);
            expect(serviceInstance.compareTo(new ServiceInstance({id: "INSTANCE_NOT_FOUND", status: ServiceInstance.Status.RUNNING}))).toBe(1);
        });

        it("should return 0 if status NONE and other status is NONE", function() {
            serviceInstance.status(ServiceInstance.Status.NONE);
            expect(serviceInstance.compareTo(new ServiceInstance({id: "INSTANCE_NOT_FOUND", status: ServiceInstance.Status.NONE}))).toBe(0);
        });
    });

    describe("isReal", function() {

        it("should return true if status is not NONE", function() {
            serviceInstance.status(ServiceInstance.Status.RUNNING);

            expect(serviceInstance.isReal()).toBe(true);
        });

        it("should return false if status is NONE", function() {
            serviceInstance.status(ServiceInstance.Status.NONE);

            expect(serviceInstance.isReal()).toBe(false);
        });
    });

    describe("isRunning", function() {

        it("should return true if status is RUNNING", function() {
            serviceInstance.status(ServiceInstance.Status.RUNNING);

            expect(serviceInstance.isRunning()).toBe(true);
        });

        it("should return false if status is not RUNNING", function() {
            serviceInstance.status(ServiceInstance.Status.STARTING);

            expect(serviceInstance.isRunning()).toBe(false);
        });
    });

    describe("Status", function() {

        describe("getForText", function() {

            it("should return the status for the given text if found", function() {
                expect(ServiceInstance.Status.getForText("Stopped")).toBe(ServiceInstance.Status.STOPPED);
                expect(ServiceInstance.Status.getForText("Up")).toBe(ServiceInstance.Status.RUNNING);
                expect(ServiceInstance.Status.getForText("Start Failed")).toBe(ServiceInstance.Status.START_FAILED);
                expect(ServiceInstance.Status.getForText("Down")).toBe(ServiceInstance.Status.DOWN);
            });

            it("should return UNKNOWN if given text not found", function() {
                expect(ServiceInstance.Status.getForText("not real status")).toBe(ServiceInstance.Status.UNKNOWN);
            });
        });
    });
});