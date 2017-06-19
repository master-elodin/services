function ServiceController(loadingData) {
    var instance = this;

    instance.startStopUnlocked = ko.observable(false);
    instance.toggleStartStop = createToggle(instance.startStopUnlocked);

    instance.activeHostGroup = loadingData.activeHostGroup;

    instance.delayForNext = ko.observable(0);
    instance.selectionGroup = ko.observableArray();

    var scrollToBottom = function() {
        var bodyEl = jQuery(".service-controller__body")[0];
        if(bodyEl) {
            bodyEl.scrollTop = bodyEl.scrollHeight;
        }
    };
    var scrollToTop = function() {
        var bodyEl = jQuery(".service-controller__body")[0];
        if(bodyEl) {
            bodyEl.scrollTop = 0;
        }
    }

    var addSelectionGroup = function(filter) {
        if(!instance.disableAddClearButtons()) {
            // selection group is a list of service instances with a delay
            instance.selectionGroup.push({delay: ko.observable(parseInt(instance.delayForNext())),
                services: ko.observableArray(instance.activeHostGroup().getServiceHealths().map(function(serviceHealth) {
                    var selected = {name: serviceHealth.name()};
                    // reset delay for next
                    instance.delayForNext(0);
                    selected.data = ko.observableArray(serviceHealth.hostHealths().filter(filter).map(function(selectedHostHealth) {
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
                }))
            });
            // scroll to bottom to be able to see newly-added items
            scrollToBottom();

            instance.activeHostGroup().getServiceHealths().forEach(function(serviceHealth) {
                serviceHealth.hostHealths().forEach(function(hostHealth) {
                    hostHealth.selected(false);
                });
            });
        }
    };

    instance.configurationName = ko.observable("default-configuration");
    instance.configurationName.subscribe(function(newVal) {
        if(newVal) {
            instance.configurationName(newVal.replace(" ", "-"));
        }
    });
    instance.showLoadSave = ko.observable(false);
    instance.toggleShowLoadSave = createToggle(instance.showLoadSave);
    var getSavedData = function() {
        var savedJson = localStorage.getItem(ServiceController.DATA_NAME);
        return savedJson ? JSON.parse(savedJson) : { configurations: [] };
    }
    instance.savedConfigNames = ko.observableArray(getSavedData().configurations.map(function(config) {
        return config.configurationName;
    }));

    var getConfigForSaving = function() {
        var configForSaving = { configurationName: instance.configurationName() };
        configForSaving.selectionGroup = ko.mapping.toJS(instance.selectionGroup);
        return configForSaving;
    };

    var addConfigToSavedData = function(newConfig, savedData) {
        var existingConfig = false;
        for(var i = 0; i < savedData.configurations.length; i++) {
            if(savedData.configurations[i].configurationName === newConfig.configurationName) {
                savedData.configurations[i] = newConfig;
                existingConfig = true;
                break;
            }
        }
        if(!existingConfig) {
            savedData.configurations.push(newConfig);
            instance.savedConfigNames.push(newConfig.configurationName);
            instance.savedConfigNames.sort(function(a, b) {
                return a.localeCompare(b);
            });
        }
        localStorage.setItem(ServiceController.DATA_NAME, JSON.stringify(savedData));
    };

    instance.save = function() {
        var savedData = getSavedData();
        addConfigToSavedData(getConfigForSaving(), savedData);
    };

    instance.load = function(configName) {
        var savedData = getSavedData();
        var configurationToLoad = savedData.configurations.find(function(config) {
            return config.configurationName === configName;
        });
        instance.configurationName(configurationToLoad.name);
        instance.selectionGroup(ko.mapping.fromJS(configurationToLoad.selectionGroup)());
        instance.showLoadSave(false);
    };

    instance.downloadConfig = function() {
        downloadAsFile(JSON.stringify(getConfigForSaving()), instance.configurationName().replace(" ", "-") + ".json");
    };

    instance.uploadConfig = function() {
        uploadFile("#upload-configuration-input", function(configText) {
            addConfigToSavedData(JSON.parse(configText), getSavedData());
        });
    };

    instance.addAll = function() {
        addSelectionGroup(function(hostHealth) {
            return hostHealth.isReal();
        });
    };
    instance.addSelected = function() {
        addSelectionGroup(function(hostHealth) {
            return hostHealth.selected() && hostHealth.isReal();
        });
    };

    instance.clear = function() {
        if(!instance.disableAddClearButtons()) {
            instance.selectionGroup([]);
        }
    };

    instance.disableAddClearButtons = ko.pureComputed(function() {
        return instance.isRunning() || instance.needsConfirmation() || instance.isAborted() || instance.showLoadSave();
    });

    instance.needsConfirmation = ko.observable(false);
    instance.confirmationType = ko.observable();
    var CONFIRMATION_TYPES = { START: "start", STOP: "stop"}

    var countdown = null;
    var runningAction = null;
    instance.isRunning = ko.observable(false);
    var run = function(serviceGroup) {
        if(serviceGroup) {
            var deferred = jQuery.Deferred();
            clearInterval(countdown);
            countdown = setInterval(function() {
                serviceGroup.delay(serviceGroup.delay() - 1);
            }, 1000);
            clearInterval(runningAction);
            runningAction = setTimeout(function() {
                clearInterval(countdown);
                var service = serviceGroup.services.shift();
                while(service) {
                    var dataList = service.data().shift();
                    while(dataList) {
                        dataList[instance.confirmationType()]();
                        dataList = service.data.shift();
                    }
                    service = serviceGroup.services.shift();
                }
                instance.selectionGroup.shift();
                deferred.resolve(instance.selectionGroup()[0]);
            }, serviceGroup.delay() * 1000);
            deferred.then(run);
        } else {
            end();
        }
    };

    var end = function() {
        clearInterval(countdown);
        clearTimeout(runningAction);
        instance.isRunning(false);
    };
    instance.isAborted = ko.observable(false);
    instance.abort = function() {
        end();
        instance.isAborted(true);
    };

    instance.confirm = function() {
        instance.isRunning(true);
        instance.needsConfirmation(false);
        run(instance.selectionGroup()[0]);
    };

    instance.cancel = function() {
        instance.needsConfirmation(false);
        instance.isAborted(false);
    };

    instance.resume = function() {
        instance.confirm();
    };

    instance.cancelRun = function() {
        instance.cancel();
        instance.clear();
    };

    var confirmRun = function(confirmationType) {
        if(!instance.isRunning()) {
            scrollToTop();
            instance.confirmationType(confirmationType);
            instance.needsConfirmation(true);
            instance.isAborted(false);
        }
    };

    instance.confirmRunStart = function() {
        confirmRun(CONFIRMATION_TYPES.START);
    };

    instance.confirmRunStop = function() {
        confirmRun(CONFIRMATION_TYPES.STOP);
    };
}
ServiceController.DATA_NAME = "saved-configurations";