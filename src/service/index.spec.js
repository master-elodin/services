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
});