describe("A Host Group", function() {

    var hostGroup;

    beforeEach(function() {
        hostGroup = new HostGroup();
    });

    afterEach(function() {
        hostGroup = null;
    });

    it("should set ID on creation", function() {
        hostGroup = new HostGroup("id");

        expect(hostGroup.id).toBe("id");
    });

    describe("addService", function() {

        it("should add services in alphabetical order", function() {
            hostGroup.addService(new Service("charlie"));
            hostGroup.addService(new Service("beta"));
            hostGroup.addService(new Service("alpha"));

            expect(hostGroup.services[0].name).toBe("alpha");
            expect(hostGroup.services[1].name).toBe("beta");
            expect(hostGroup.services[2].name).toBe("charlie");
        });

        it("should merge services instances if service already exists", function() {
            var service1 = new Service("id1");
            spyOn( service1, 'merge' ).and.stub();

            hostGroup.addService(service1);

            var service2 = new Service("id1");
            var serviceInstance = new ServiceInstance("serviceInstance1");
            service2.addServiceInstance(serviceInstance);

            hostGroup.addService(service2);

            var service3 = new Service("id2");
            service3.addServiceInstance(new Service("serviceInstance2"));

            hostGroup.addService(service3);

            expect( service1.merge ).toHaveBeenCalledWith( service2 );
            expect( hostGroup.services.length ).toBe( 2 );
        });
    });
});