describe("A Host ", function() {

    var host;

    beforeEach(function() {
        host = new Host();
    });

    afterEach(function() {
        host = null;
    });

    it("should set name on creation", function() {
        host = new Host("name");

        expect(host.name()).toBe("name");
    });

    describe("addService", function() {

        it("should add services in alphabetical order", function() {
            host.addService(new Service("charlie"));
            host.addService(new Service("beta"));
            host.addService(new Service("alpha"));

            expect(host.services[0].name).toBe("alpha");
            expect(host.services[1].name).toBe("beta");
            expect(host.services[2].name).toBe("charlie");
        });

        it("should merge services instances if service already exists", function() {
            var service1 = new Service("name1");
            spyOn( service1, 'merge' ).and.stub();

            host.addService(service1);

            var service2 = new Service("name1");
            var serviceInstance = new ServiceInstance("serviceInstance1");
            service2.addServiceInstance(serviceInstance);

            host.addService(service2);

            var service3 = new Service("name2");
            service3.addServiceInstance(new Service("serviceInstance2"));

            host.addService(service3);

            expect( service1.merge ).toHaveBeenCalledWith( service2 );
            expect( host.services.length ).toBe( 2 );
        });
    });
});