let config = {};
const socketModes = {
    StreamerbotClient,
    DebugClient: class {
        on(channel, callback) {
            const damageTypes = [ 'Bullet', 'VehicleDestruction', 'Suicide', 'Crash', 'unknown'];
            const names = ['Kendall','Saul','Selena','Rylee','Ashtyn','Mohammed','Bianca','Lee','Hailie','Hanna','Ishaan','Avery','Trenton','Coby','Katelyn','Hassan','Audrey','Braydon','Juliana','Emanuel','Porter','Corbin','Gillian','Hayden'];
            const using = ['Laser', 'Ballistic', 'Missile']
            const random = array => array[Math.floor(Math.random() * array.length)];
            this.interval = setInterval(() => callback({data: {
                    "event": "kill-log",
                    "victim": random(names),
                    "attacker": random(names),
                    "damageType": random(damageTypes),
                    "using": random(using)
                }}), (config.fadeTime * 0.55) * 1000);
        }
    }
};


function checkEvent(event) {
    return !!event.detail;
}

function firstMatch(mapping, query) {
    return Object.entries(mapping).filter(([_name, regex]) => regex.test(query)).map(([name]) => name)[0];
}

function getName(person) {
    const mapping = {
        'Outlaw': /Criminal/i,
        'Nine Tails': /NineTails/i,
        'Security': /Guard/i,
        'Civilian': /civilian/i
    };

    return firstMatch(mapping, person) || person;
}

function getKillSubtype({using, damageType}) {
    const mapping = {
        'ballistic': /ballistic/i,
        'laser': /laser/i,
    }
    const hasSubtype = ['VehicleDestruction', 'Bullet'];

    if(!hasSubtype.includes(damageType)) {
        return;
    }

    return firstMatch(mapping, using);
}

function getKillType(data) {
    const {damageType} = data;
    const mapping = {
        'Bullet': 'fps',
        'VehicleDestruction': 'ship',
        'Crash': 'crash',
        'Suicide': 'backspace'
    }

    return getKillSubtype(data) || mapping[damageType] || damageType
}

function getIcon(icon) {
    if(!icon) {
        return '';
    }

    return `<img src="${icon}" height="${config.fontSize}" width="${config.fontSize}">`;
}

function parseKillMessage(data) {
    const killType = getKillType(data);
    const text = config[`${killType}Text`] || config.defaultText;
    data.icon = getIcon(config[`${killType}Icon`] || config.defaultIcon);
    return Object.entries(data).reduce((res, [k,v]) => res.replace(`{${k}}`, v), text);
}

function generateElement(data) {
    return $(`<span class="row fade">${parseKillMessage(data)}</span>`);
}

const eventHandlers = {
    'kill-log': (data) => {
        const $element = generateElement(data);
        $('#main-container').prepend($element);
        const fadeTime = config.fadeTime * 1000;
        setTimeout(() => $element.remove(), fadeTime + 1000);
    }
};

window.addEventListener("onWidgetLoad", async (event) => {
    if (!checkEvent(event)) {
        return;
    }
    config = event.detail.fieldData;
    const client = new socketModes[config.socketMode]({
        host: config.socketHost,
        port: config.socketPort,
        endpoint: config.endpoint,
        subscribe: 'General.Custom'
    });
    client.on('General.Custom',  ({data: {event, ...data}}) => {
        if(!event || !eventHandlers[event]) {
            return;
        }

        eventHandlers[event](data);
    });
})