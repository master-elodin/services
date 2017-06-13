describe("A Host Group", function() {

    var hostGroup;

    beforeEach(function() {
        hostGroup = new HostGroup();
    });

    afterEach(function() {
        hostGroup = null;
    });

    describe("addHost", function() {

        it("should return host", function() {
            var host = hostGroup.addHost("alpha");

            expect(hostGroup.hosts()[0]).toBe(host);
        });

        it("should add host in alphabetic order based on name", function() {
            hostGroup.addHost("charlie");
            hostGroup.addHost("beta");
            hostGroup.addHost("alpha");

            expect(hostGroup.hosts()[0].name()).toBe("alpha");
            expect(hostGroup.hosts()[1].name()).toBe("beta");
            expect(hostGroup.hosts()[2].name()).toBe("charlie");
        });
    });

    describe("addService", function() {

        it("should add services in alphabetical order", function() {
            hostGroup.addService(new Service("charlie"));
            hostGroup.addService(new Service("beta"));
            hostGroup.addService(new Service("alpha"));

            expect(hostGroup.services()[0].name).toBe("alpha");
            expect(hostGroup.services()[1].name).toBe("beta");
            expect(hostGroup.services()[2].name).toBe("charlie");
        });

        it("should merge services instances if service already exists", function() {
            var service1 = new Service("name1");
            spyOn( service1, 'merge' ).and.stub();

            hostGroup.addService(service1);

            var service2 = new Service("name1");
            var serviceInstance = new ServiceInstance("serviceInstance1");
            service2.addServiceInstance(serviceInstance);

            hostGroup.addService(service2);

            var service3 = new Service("name2");
            service3.addServiceInstance(new Service("serviceInstance2"));

            hostGroup.addService(service3);

            expect( service1.merge ).toHaveBeenCalledWith( service2 );
            expect( hostGroup.services().length ).toBe( 2 );
        });
    });

    describe("select", function() {

        it("should toggle active", function() {
            expect(hostGroup.isActive()).toBe(false);

            hostGroup.select();

            expect(hostGroup.isActive()).toBe(true);

            hostGroup.select();

            expect(hostGroup.isActive()).toBe(false);
        });
    });
});