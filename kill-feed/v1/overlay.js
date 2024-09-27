let config = {};
const defaultKill = '{attacker} {icon} {victim}';

function checkEvent(event) {
    return !!event.detail;
}

function getDamageIndicator(damageType) {
    return damageType;
}

function getVictimName(victim) {
    console.log('victim', victim);
    const mapping = {
        'Nine Tails': /Criminal/i,
        'Security': /Guard/i,
        'Civilian': /civilian/i
    };

    const [match] = Object.entries(mapping).filter(([_name, regex]) => regex.test(victim)).map(([name]) => name)
    return match || victim;
}

function parseKillMessage(data) {
    const text = config.ballisticText || defaultKill;
    data.icon = config.ballisticIcon;
    return Object.entries(data).reduce((res, [k,v]) => res.replace(`{${k}}`, v), text);
}

function generateElement(data) {
    const {attacker, victim, damageType} = data;
    return $(`<tr class="fade"><td>${attacker}</td><td>${getDamageIndicator(damageType)}</td><td>${getVictimName(victim)}</td></tr>`);
}

const eventHandlers = {
    'kill-log': (data) => {
        const $element = generateElement(data);
        $('#main-container').prepend($element);
        const fadeTime = config.fadeTime * 1000;
        setTimeout(() => $element.addClass('fade'), fadeTime);
        setTimeout(() => $element.remove(), fadeTime + 1500);
    }
};

window.addEventListener("onWidgetLoad", async (event) => {
    if (!checkEvent(event)) {
        return;
    }
    config = event.detail.fieldData;
    const client = new StreamerbotClient({
        host: config.socketHost,
        port: config.socketPort,
        subscribe: 'General.Custom'
    });
    client.on('General.Custom',  ({data: {event, ...data}}) => {
        if(!event || !eventHandlers[event]) {
            return;
        }

        eventHandlers[event](data);
    });
})