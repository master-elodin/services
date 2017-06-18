function ServiceController(loadingData) {
    var instance = this;

    instance.startStopUnlocked = ko.observable(false);
    instance.toggleStartStop = createToggle(instance.startStopUnlocked);

    instance.activeHostGroup = loadingData.activeHostGroup;

    instance.delayForNext = ko.observable(0);
    instance.serviceInstances = ko.observableArray();
    
    instance.addSelected = function() {
        instance.serviceInstances.push.apply(instance.serviceInstances, instance.activeHostGroup().getServiceHealths().map(function(serviceHealth) {
            var selected = {name: serviceHealth.name(), delay: ko.observable(instance.delayForNext())};
            // reset delay for next
            instance.delayForNext(0);
            selected.data = ko.observableArray(serviceHealth.hostHealths().filter(function(hostHealth) {
                return hostHealth.selected() && hostHealth.isReal();
            }).map(function(selectedHostHealth) {
                return {
                    id: selectedHostHealth.id(), 
                    version: selectedHostHealth.version(), 
                    hostName: selectedHostHealth.hostName(),
                    start: selectedHostHealth.start,
                    stop: selectedHostHealth.stop
                };
            }).sort(function(a, b) {
                return a.hostName.localeCompare(b.hostName);
            }));
            return selected;
        }).filter(function(serviceInstance) {
            return serviceInstance.data().length > 0;
        }));
        instance.activeHostGroup().getServiceHealths().forEach(function(serviceHealth) {
            serviceHealth.hostHealths().forEach(function(hostHealth) {
                hostHealth.selected(false);
            });
        });
    };

    instance.clear = function() {
        instance.serviceInstances([]);
    };

    instance.needsConfirmation = ko.observable(false);
    instance.confirmationType = ko.observable();
    var CONFIRMATION_TYPES = { START: "start", STOP: "stop"}

    var runningAction = null;
    instance.isRunning = ko.observable(false);
    var run = function(serviceInstance) {
        if(serviceInstance) {
            var deferred = jQuery.Deferred();
            var countdown = setInterval(function() {
                serviceInstance.delay(serviceInstance.delay() - 1);
            }, 1000);
            runningAction = setTimeout(function() {
                clearInterval(countdown);
                var dataList = serviceInstance.data().shift();
                while(dataList) {
                    dataList[instance.confirmationType()]();
                    dataList = serviceInstance.data.shift();
                }
                deferred.resolve(instance.serviceInstances.shift());
            }, serviceInstance.delay());
            deferred.then(run);
        } else {
            instance.abort();
        }
    };

    instance.abort = function() {
        clearTimeout(runningAction);
        instance.isRunning(false);
        instance.needsConfirmation(false);
    };

    instance.confirm = function() {
        run(instance.serviceInstances().shift());
    };

    instance.cancel = function() {
        instance.needsConfirmation(false);
    }

    instance.confirmRunStart = function() {
        instance.confirmationType(CONFIRMATION_TYPES.START);
        instance.needsConfirmation(true);
    };

    instance.confirmRunStop = function() {
        instance.confirmationType(CONFIRMATION_TYPES.STOP);
        instance.needsConfirmation(true);
    };
}