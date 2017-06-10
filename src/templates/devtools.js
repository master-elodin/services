// @name         ${name}
// @version      ${version}
// @description  ${description}
// @author       ${author}

var addScript=function(a){var b=document.createElement("script");b.src=a,document.getElementsByTagName("head")[0].appendChild(b)};
var scripts = [${externalDependencies}];
scripts.forEach(addScript);

setTimeout(function(){
${content}
}, 1000);