// hide existing body while things are loading
document.body = document.createElement("body");
document.body.innerHTML = "<div><h2>Loading...</h2></div>";
// remove existing css so it doesn't conflict
for(var i=0;i<document.styleSheets.length;i++){document.styleSheets[i].disabled=true;}

var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = [${bin/combined.css}].join('');
document.getElementsByTagName('head')[0].appendChild(style);

// TODO: modularize external CSS
var external = document.createElement('link');
external.href = 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css';
external.rel = "stylesheet";
document.getElementsByTagName('head')[0].appendChild(external);

${src/utils/utils.js}
${src/data/data.js}
${src/service-instance/service-instance.js}
${src/host-health/host-health.js}
${src/service/service.js}
${src/item/item.js}
${src/action-runner/action-runner.js}
${src/service-controller/service-controller.js}
${src/selections/selections.js}
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
    var page = new Page();
    page.load();

    ko.applyBindings(page);