// @name         Services
// @version      0.0.1
// @description  Make the Service Console look nicer!
// @author       Tim VanDoren

var addScript=function(a){var b=document.createElement("script");b.src=a,document.getElementsByTagName("head")[0].appendChild(b)};
var scripts = ["https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js","https://cdnjs.cloudflare.com/ajax/libs/knockout/3.4.0/knockout-min.js","https://cdnjs.cloudflare.com/ajax/libs/knockout.mapping/2.4.1/knockout.mapping.min.js","https://cdnjs.cloudflare.com/ajax/libs/js-cookie/2.1.3/js.cookie.min.js"];
scripts.forEach(addScript);

setTimeout(function(){
(function() {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '    background-color: $somethingElse; font-size: 16px; color: $clouds; background-color: blue; ';
    document.getElementsByTagName('head')[0].appendChild(style);
});
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
    function Page() {
        var instance = this;
    
        instance.environments = [new Environment('DEV'), new Environment('QA'), new Environment('PROD')];
    }

    jQuery('html').html('<body>    <div class="page"><h1>hello world, here are environments</h1><!-- ko foreach: environments -->    ENVIRONMENT    <!-- /ko --></div></body>');
    ko.applyBindings(new Page());

}, 500);
