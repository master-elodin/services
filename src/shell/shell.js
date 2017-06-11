var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = [${bin/combined.css}].join('');
document.getElementsByTagName('head')[0].appendChild(style);

// TODO: modularize external CSS
var external = document.createElement('link');
external.href = 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css';
external.rel = "stylesheet";
document.getElementsByTagName('head')[0].appendChild(external);

${src/data-row/data-row.js}
${src/service-instance/service-instance.js}
${src/service/service.js}
${src/host/host.js}
${src/host-group/host-group.js}
${src/environment/environment.js}
${src/application/application.js}
${src/page/page.js}

${bin/combined.html}

    ko.bindingHandlers.enterkey = {
        init: function (element, valueAccessor, allBindings, viewModel) {
            var callback = valueAccessor();
            $(element).keypress(function (event) {
                var keyCode = (event.which ? event.which : event.keyCode);
                if (keyCode === 13) {
                    callback.call(viewModel);
                    return false;
                }
                return true;
            });
        }
    };

    ko.applyBindings(new Page());