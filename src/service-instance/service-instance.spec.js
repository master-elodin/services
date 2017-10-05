describe("A Service Instance", function() {

    var serviceInstance;

    beforeEach(function() {
        serviceInstance = new ServiceInstance({id: "GROUP;SERVICE;1_0_0;host1;Stopping", version: "1.22.1"});
    });

    afterEach(function() {
        serviceInstance = null;
    });

    it("should set ID on creation", function() {
        expect( serviceInstance.id ).toBe( "GROUP;SERVICE;1_0_0;host1;Stopping" );
    });

    it("should set idWithoutStatus on creation", function() {
        expect( serviceInstance.idWithoutStatus ).toBe( "GROUP;SERVICE;1_0_0;host1" );
    });

    it("should set version on creation", function() {
        expect( serviceInstance.version ).toBe( "1.22.1" );
    });

    it("should be able to update status", function() {
        serviceInstance.status(ServiceInstance.Status.RUNNING);

        expect(serviceInstance.status()).toBe( ServiceInstance.Status.RUNNING );

        serviceInstance.status(ServiceInstance.Status.STOPPED);

        expect(serviceInstance.status()).toBe( ServiceInstance.Status.STOPPED );
    });

    describe("compareTo", function() {

        var expectSortOrder = function(other, expectedOrder) {
            expect([serviceInstance, other].sort(function(a, b) { return a.compareTo(b); }).indexOf(serviceInstance)).toBe(expectedOrder);
        }

        it("should return 0 if equal versions", function() {
            expect(serviceInstance.compareTo(new ServiceInstance({id: "otherId", version: serviceInstance.version})) === 0).toBe(true);
        });

        it("should be sorted second if lower major version than other", function() {
            expectSortOrder(new ServiceInstance({id: "otherId", version: "2.2.0"}), 1);
        });

        it("should be sorted first if higher major version than other", function() {
            expectSortOrder(new ServiceInstance({id: "otherId", version: "0.2.0"}), 0);
        });

        it("should be sorted second if lower minor version than other", function() {
            expectSortOrder(new ServiceInstance({id: "otherId", version: "1.23.0"}), 1);
        });

        it("should be sorted first if higher minor version than other", function() {
            expectSortOrder(new ServiceInstance({id: "otherId", version: "1.21.0"}), 0);
        });

        it("should be sorted second if lower patch version than other", function() {
            expectSortOrder(new ServiceInstance({id: "otherId", version: "1.22.2"}), 1);
        });

        it("should be sorted first if higher patch version than other", function() {
            expectSortOrder(new ServiceInstance({id: "otherId", version: "1.22.0"}), 0);
        });

        it("should be sorted first if status not NONE and other status is NONE", function() {
            serviceInstance.status(ServiceInstance.Status.RUNNING);
            expect(serviceInstance.compareTo(new ServiceInstance({id: "INSTANCE_NOT_FOUND", status: ServiceInstance.Status.NONE})) < 0).toBe(true);
        });

        it("should be sorted second if status NONE and other status is not NONE", function() {
            serviceInstance.status(ServiceInstance.Status.NONE);
            expect(serviceInstance.compareTo(new ServiceInstance({id: "INSTANCE_NOT_FOUND", status: ServiceInstance.Status.RUNNING})) > 0).toBe(true);
        });

        it("should return 0 if status NONE and other status is NONE", function() {
            serviceInstance.status(ServiceInstance.Status.NONE);
            expect(serviceInstance.compareTo(new ServiceInstance({id: "INSTANCE_NOT_FOUND", status: ServiceInstance.Status.NONE}))).toBe(0);
        });

        it("should be sorted first if status RUNNING and other status not RUNNING", function() {
            serviceInstance.status(ServiceInstance.Status.RUNNING);
            expect(serviceInstance.compareTo(new ServiceInstance({id: "INSTANCE_NOT_FOUND", status: ServiceInstance.Status.NONE})) < 0).toBe(true);
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

    describe("isChanging", function() {

        it("should return true if status=STARTING", function() {
            serviceInstance.status(ServiceInstance.Status.STARTING);

            expect(serviceInstance.isChanging()).toBe(true);
        });

        it("should return true if status=STOPPING", function() {
            serviceInstance.status(ServiceInstance.Status.STOPPING);

            expect(serviceInstance.isChanging()).toBe(true);
        });

        it("should return false if not STARTING or STOPPING", function() {
            serviceInstance.status(ServiceInstance.Status.UNKNOWN);

            expect(serviceInstance.isChanging()).toBe(false);
        });
    });
});