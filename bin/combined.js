var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = '    .service-page { background-color: rgba(255, 255, 255, .7); min-height: 100%; }  .service-page__header { background-color: rgba(0, 0, 0, .7); height: 50px; width: 100%; }  .service-page__header-icon { float: left; height: 100%; }  .service-page__header-icon .fa { color: rgba(255, 255, 255, .7); cursor: pointer; font-size: 40px; padding: 5px; }  .service-page__body { font-size: 18px; height: 100%; padding: 10px; }  .service-page__data-row { display: flex; justify-content: space-between; width: 400px; }  .service-page__data-row--application { padding-left: 15px; }  .data-row__name {  } html, body { background-color: rgba(255, 255, 255, .7); height: 100%; margin: 0; min-height: 100%; padding: 0; } ';
document.getElementsByTagName('head')[0].appendChild(style);

// TODO: modularize external CSS
var external = document.createElement('link');
external.href = 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css';
external.rel = "stylesheet";
document.getElementsByTagName('head')[0].appendChild(external);

    function ServiceInstance(id, version) {
        var instance = this;
    
        instance.id = id;
        instance.version = version;
        
        instance.status = ko.observable(ServiceInstance.Status.UNKNOWN);
    
        instance.isRunning = function() {
            return instance.status() === ServiceInstance.Status.RUNNING;
        }
    
        instance.start = function() {
            console.log( "Start!" );
        }
    
        instance.stop = function() {
            console.log( "Stop!" );
        }
    
        instance.restart = function() {
            console.log( "Restart!" );
        }
    }
    ServiceInstance.Status = {
        // TODO: find real statuses
        RUNNING: "Up",
        STOPPED: "Stopped",
        STOPPING: "Stopping",
        STARTING: "Starting",
        UNKNOWN: "Unknown"
    };
    function Service(name) {
        var instance = this;
    
        instance.name = name;
        instance.instancesByHost = {};
    
        instance.addServiceInstance = function(hostName, serviceInstance) {
            if(!instance.instancesByHost[hostName]) {
                instance.instancesByHost[hostName] = [];
            }
            // find an existing one with the same ID
            var foundExisting = false;
            for(var i = 0; i < instance.instancesByHost[hostName].length; i++) {
                if(instance.instancesByHost[hostName][i].id === serviceInstance.id) {
                    instance.instancesByHost[hostName][i] = serviceInstance;
                    foundExisting = true;
                    break;
                }
            }
            if(!foundExisting) {
                instance.instancesByHost[hostName].push(serviceInstance);
            }
            instance.instancesByHost[hostName].sort(function(a, b) {
                // sort in descending order by version (major.minor.patch)
                var partsA = a.version.split(".");
                var partsB = b.version.split(".");
                for(var i = 0; i < partsA.length; i++) {
                    var diff = parseInt(partsB[i]) - parseInt(partsA[i]);
                    if(diff !== 0) {
                        return diff;
                    }
                }
                return 0;
            });
        };
    
        instance.merge = function(otherService) {
            // add each service from each host on otherService
            Object.keys(otherService.instancesByHost).forEach(function(host) {
                otherService.instancesByHost[host].forEach(function(serviceInstance) {
                    instance.addServiceInstance(host, serviceInstance);
                });
            });
        };
    }
    function HostGroup(id) {
        var instance = this;
    
        instance.id = id;
        instance.services = [];
    
        instance.addService = function(newService) {
            var existingService = instance.services.find(function(service) {
                return service.name === newService.name;
            });
            if(existingService) {
                existingService.merge(newService);
            } else {
                instance.services.push(newService);
                instance.services.sort(function(a, b) {
                    return a.name.localeCompare(b.name);
                });
            }
        };
    }
    function Environment(name) {
        var instance = this;
    
        instance.name = name;
    
        instance.hosts = [];
    
        instance.addHost = function(hostName) {
            instance.hosts.push(hostName);
            instance.hosts.sort();
        }
    }
    function Application(name) {
        var instance = this;
    
        instance.name = name;
    }
    function Page() {
        var instance = this;
    
        instance.applications = ko.observableArray([new Application("Suite")]);
    }

    jQuery('body').removeClass().removeAttr('style').html('<body>    <div class="service-page"><div class="service-page__header"><div class="service-page__header-icon"><i class="fa fa-home" aria-hidden="true"></i></div></div><div class="service-page__body"><!-- ko foreach: applications --><div class="service-page__data-row service-page__data-row--application"><div class="data-row__name"><span data-bind="text: name"></span></div><div class="data-row__add"><i class="fa fa-plus" aria-hidden="true"></i></div></div><!-- /ko --></div></div></body>');
    ko.applyBindings(new Page());
