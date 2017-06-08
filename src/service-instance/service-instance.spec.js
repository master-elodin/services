describe("A Service Instance", function() {

    var serviceInstance;

    beforeEach(function() {
        serviceInstance = new ServiceInstance();
    });

    afterEach(function() {
        serviceInstance = null;
    });

    it("should set ID on creation", function() {
        serviceInstance = new ServiceInstance( "someId" );

        expect( serviceInstance.id ).toBe( "someId" );
    });

    it("should set version on creation", function() {
        serviceInstance = new ServiceInstance( "someId", "1.17.3" );

        expect( serviceInstance.version ).toBe( "1.17.3" );
    });

    it("should be able to update status", function() {
        expect(serviceInstance.status()).toBe( "Unknown" );

        serviceInstance.status(ServiceInstance.Status.RUNNING);

        expect(serviceInstance.status()).toBe( ServiceInstance.Status.RUNNING );

        serviceInstance.status(ServiceInstance.Status.STOPPED);

        expect(serviceInstance.status()).toBe( ServiceInstance.Status.STOPPED );
    });

    describe("isRunning", function() {

        it("should return true if status is RUNNING", function() {
            serviceInstance.status( ServiceInstance.Status.RUNNING);

            expect(serviceInstance.isRunning()).toBe(true);
        });

        it("should return false if status is not RUNNING", function() {
            serviceInstance.status( ServiceInstance.Status.STOPPED);

            expect(serviceInstance.isRunning()).toBe(false);

            serviceInstance.status( ServiceInstance.Status.STARTING);

            expect(serviceInstance.isRunning()).toBe(false);
        });
    });
});