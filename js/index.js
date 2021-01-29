const button = document.getElementById("searchButton");
const tableDiv = document.getElementById("tableDiv");
const services = document.getElementById('service');
const commands = document.getElementById('command');
const serviceChoices = document.querySelector('.service-choices');
const commandChoices = document.querySelector('.command-choices');
const buttonClasses = ['is-primary', 'is-success', 'is-warning', 'is-error'];

let serviceData = [];
let apiData = {};


fetch(`/data/services.json`)
.then( 
    response => response.json()
    .then( 
        data => serviceData = data
    )
)
.catch( (response) => console.error(response))

fetch(`/data/apis.json`)
.then( 
    response => response.json()
    .then( 
        data => apiData = data
    )
)
.catch( (response) => console.error(response))

const updateService = (e) => {
    services.value = e.target.innerText; 
    services.focus();
    serviceChoices.innerHTML = '';
};

const updateCommand = (e) => {
    commands.value = e.target.innerText; 
    commands.focus();
    commandChoices.innerHTML = '';
};

const findMatch = (input, choices) => {
    return choices.filter( 
        (choices) => choices.toLowerCase().indexOf(input.toLowerCase()) === 0
    );
}

const fillWithButtons = (parent, number) => {
    const but = '<button type="button">Success</button>';
    parent.innerHTML = but.repeat(number);
}

const showChoices = (parent, choices, fn) => {
    fillWithButtons(parent, choices.length)
    const buttons = Array.prototype.slice.call(
        parent.querySelectorAll(`button`)
    );
    for (const i in choices) {
        const random = Math.floor(Math.random() * buttonClasses.length);
        const b = buttons.pop();
        b.innerText = choices[i];
        b.classList = ['nes-btn'];
        b.classList.add(buttonClasses[random]);
        b.addEventListener('click', fn, false);
    }
}

const snakeToCamel = (str) => {
    str = str.charAt(0).toUpperCase() + str.slice(1);
    return str.replace(
    /([-_][a-z])/g,
    (group) => group.toUpperCase()
                    .replace('-', '')
                    .replace('_', '')
    );
}

const updateTable = (service, command, data) => {
    let boto3 = 'Not supported',
        cliV1 = 'Not supported',
        cliV2 = 'Not supported',
        apiVersions = '';

    tableDiv.hidden = false;
    document.getElementById("serviceCell").innerText = service;
    document.getElementById("commandCell").innerText = command;
    if (data) {
        boto3 = data.boto3 ?  data.boto3 : 'Not supported';
        cliV1 = data.cli_v1 ? data.cli_v1 : 'Not supported';
        cliV2 = data.cli_v2 ? data.cli_v2 : 'Not supported';
        if (data.api_versions) {
            const versions = [];
            for (let index in data.api_versions) {
                const version = data.api_versions[index];
                versions.push('Ver: ' + version.api_version + (version.deprecated ? ' Derprecated' : ''));
            }
            apiVersions = versions.join('<hr>')
        }
    }

    document.getElementById("botoCell").innerText = boto3;
    document.getElementById("cliV1Cell").innerText = cliV1;
    document.getElementById("cliV3Cell").innerText =  cliV2;
    document.getElementById("apiVersionsCell").innerHTML = apiVersions;

}

const addEventListenerList = (list, event, fn) => {
    for (var i = 0, len = list.length; i < len; i++) {
        list[i].addEventListener(event, fn, false);
    }
}

button.addEventListener("click",function(e){
    let serviceName = document.getElementById("service").value.toLowerCase();
    let commandName = snakeToCamel(document.getElementById("command").value);
    fetch(`/data/${serviceName}/${commandName}/data.json`)
    .then( 
        response => response.json()
        .then( 
            data => updateTable(serviceName, commandName, data)
        )
        )
    .catch( (response) => updateTable(serviceName, commandName))
}, false);

services.addEventListener("input", function(e){
    const input =  e.target.value;
    if (input.length > 0 && serviceData.length > 0) {
        const choices = findMatch(input, serviceData);
        if (choices.length > 0) {
            showChoices(serviceChoices, choices, updateService);
        }
    } else {
        serviceChoices.innerHTML = '';
    }
}, false);

commands.addEventListener("input", function(e){
    const input =  e.target.value;
    if (input.length > 0 && apiData[services.value]) {
        const choices = findMatch(input, apiData[services.value]);
        if (choices.length > 0) {
            showChoices(commandChoices, choices, updateCommand); 
        }
    } else {
        commandChoices.innerHTML = '';
    }
}, false);

commands.addEventListener("keypress", function(e){
    if (e.key === 'Enter') {
        button.click()
    }
});

services.addEventListener("keypress", function(e){
    if (e.key === 'Enter') {
        commands.focus();
    }
});
