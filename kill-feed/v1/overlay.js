/* globals StreamerbotClient, $ */
let config = {};
const dupeFix = {}
const socketModes = {
    StreamerbotClient,
    DebugClient: class {
        on(channel, callback) {
            if(this.interval) {
                clearInterval(this.interval);
            }
            const damageTypes = ['Bullet', 'VehicleDestruction', 'Suicide', 'Crash', 'unknown', 'Explosion'];
            const names = ['Kendall', 'Saul', 'Selena', 'Rylee', 'Ashtyn', 'Mohammed', 'Bianca', 'Lee', 'Hailie', 'Hanna', 'Ishaan', 'Avery', 'Trenton', 'Coby', 'Katelyn', 'Hassan', 'Audrey', 'Braydon', 'Juliana', 'Emanuel', 'Porter', 'Corbin', 'Gillian', 'Hayden'];
            const using = ['Laser', 'Ballistic', 'Missile']
            const random = array => array[Math.floor(Math.random() * array.length)];
            this.interval = setInterval(() => callback({data: {
                    "event": "kill-log",
                    "victim": random(names),
                    "attacker": random(names),
                    "damageType": random(damageTypes),
                    "using": random(using)
                }
            }), (config.fadeTime * 0.55) * 1000);
        }
    }
};

function checkEvent(event) {
    return !!event.detail && !!event.detail.fieldData;
}

function firstMatch(mapping, query) {
    return Object.entries(mapping).filter(([_name, regex]) => regex.test(query)).map(([name]) => name)[0];
}

function getName(person) {
    const mapping = {
        'Outlaw': /Criminal|Outlaw/i,
        'Nine Tails': /NineTails/i,
        'Hurston Security': /Hurston/i,
        'Civilian': /civilian/i,
        'Crusader Guard': /crusader/i,
        'MicroTech Security': /Microtech/i,
        'UEE Navy': /UEE/,
        'Duster': /Dusters/i,
        'Distro Center Worker': /SakuraSun/,
    };

    return firstMatch(mapping, person) || person;
}

function getKillSubtype({using, damageType}) {
    const mapping = {
        'ballistic': /ballistic/i,
        'laser': /laser/i,
    }
    const hasSubtype = ['Bullet'];

    if (!hasSubtype.includes(damageType)) {
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
        'Suicide': 'backspace',
        'Explosion': 'explosion'
    }

    return getKillSubtype(data) || mapping[damageType] || damageType
}

function getIcon(icon) {
    if (!icon) {
        return '';
    }

    return `<img src="${icon}" height="${config.fontSize}">`;
}

function parseKillMessage(data) {
    const killType = getKillType(data);
    const text = config[`${killType}Text`] || config.otherText;
    data.icon = getIcon(config[`${killType}Icon`] || config.otherIcon);
    return Object.entries(data).reduce((res, [k, v]) => res.replace(`{${k}}`, getName(v)), text);
}

function generateElement(data) {
    return $(`<span class="slide">${parseKillMessage(data)}</span>`);
}

function isDupe(victim, now) {
    return dupeFix[victim] && (now - dupeFix[victim]) <= 2000;
}

function isNPC({attacker, victim}) {
    const regex = /^(NPC|PU)_/i;
    return config.showNpcs && (regex.test(attacker) || regex.test(victim));
}

function isNpcOrDupe(data) {
    const {victim} = data;
    const now = Date.now();
    const dupeOrNpc = isNPC(data) || isDupe(victim, now);
    if(!dupeOrNpc) {
        dupeFix[victim] = now;
    }
    return dupeOrNpc;
}

const eventHandlers = {
    'kill-log': (data) => {
        if(isNpcOrDupe(data)) {
            return;
        }
        const $element = generateElement(data);
        $('#main-container').prepend($element);
        const ms = 1000;
        const fadeTime = config.fadeTime * ms;
        setTimeout(() => $element.removeClass('slide').addClass('fade'), fadeTime);
        setTimeout(() => $element.remove(), fadeTime + ms);
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
        endpoint: config.socketEndpoint,
        subscribe: 'General.Custom'
    });
    client.on('General.Custom', ({data: {event, ...data}}) => {
        if (!event || !eventHandlers[event]) {
            return;
        }

        eventHandlers[event](data);
    });
})