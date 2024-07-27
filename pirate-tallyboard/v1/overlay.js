const OVERLAY_ID = '7dceda52-7bc3-4ca6-9a1f-21f2d644afc7';
const PERMISSIONS = {
    broadcaster: 1,
    moderator: 2,
    vip: 3,
    subscriber: 5,
    everyone: 999
};

const config = {
    multipliers: {
        'o': 1,
        'h': 100,
        'k': 1000,
        'm': 1000000
    },
    defaults: {
        decimalPlaces: 1,
        formattableMultipliers: ['m', 'k']
    },
    storage: `bhd-${OVERLAY_ID}`
};
let initialized = false;
let storage = undefined;

async function get() {
    if (!storage) {
        const res = (await SE_API.store.get(config.storage));
        storage = res || {};
    }
    return storage;
}

async function set(id, value) {
    storage[id] = value;
    const updated = update()
    if(updated) {
        updateListItem(id, value);
        return value;
    }
}

async function update() {
    return await SE_API.store.set(config.storage, storage)
}

function splitKey(key) {
    key = key.substring(5);
    let match = key.match(/^(\d+)(.+)/);
    if (match) {
        return [parseInt(match[1]), match[2]];
    }
}

function getFieldId(key) {
    return splitKey(key)[0];
}

function getFieldSubtype(key) {
    let subType = splitKey(key)[1];
    return subType[0].toLowerCase() + subType.substring(1);
}

function parseMultiplier(value) {
    const [multiMatch] = value.match(/\.*[a-z]+$/i) || ['o'];
    return config.multipliers[multiMatch] || 1;
}

function getAndRemoveSign(value) {
    const sign = value[0] === '-' ? -1 : 1;
    return [sign, value.replace(/^[+\-]/, '')];
}

function hasSign(value) {
    return /^[+\-]/.test(value);
}

function parseNumber(value) {
    const parsed = Number(value);
    if(!isNaN(parsed)) {
        return parsed;
    }

    const [sign, v] = getAndRemoveSign(value);
    if(hasSign(value) && value.length === 1) {
        return sign;
    }

    if(!new RegExp(`^([0-9]*[.])?[0-9]+[${Object.keys(config.multipliers).join('')}]$`).test(v)) {
        return 0;
    }

    const [match] = v.match(/^([0-9]*[.])?[0-9]+/);
    let numeric = parseFloat(match);
    return numeric * parseMultiplier(v) * sign;
}

function normalize(value) {
    return `${value}`.toLowerCase().trim();
}

function formatValue(value) {
    const [suffix] = config.defaults.formattableMultipliers.filter(m => value >= (config.multipliers[m] * 0.75));
    const rounder = 10**config.decimalPlaces;
    if (suffix) {
        return `${Math.floor((value / config.multipliers[suffix]) * rounder) / rounder}${suffix}`;
    }
    return `${value}`;
}

function getHighestBadgeLevel(badges) {
    let badgeValue = PERMISSIONS.everyone;
    badges.forEach(badge => {
        if (PERMISSIONS.hasOwnProperty(badge) && PERMISSIONS[badge] < badgeValue) {
            badgeValue = PERMISSIONS[badge];
        }
    });
    return badgeValue;
}

function getPermissions(badges) {
    const badgeList = (Object.keys(badges).length > 0) ? badges.map(badge => badge.type.toLowerCase()): [];
    return getHighestBadgeLevel(badgeList) || PERMISSIONS.everyone;
}

function hasDebugPermission(nick) {
    return config.debugMode && nick.toLowerCase() === 'blackholedevice';
}

function hasPermission(permission, badges, nick) {
    return getPermissions(badges) <= PERMISSIONS[permission] || hasDebugPermission(nick);
}

function onCooldown({id, cooldown, lastUsed}, now) {
    return (now - (lastUsed || 0)) < cooldown;
}

const functions = {
    counter: async (id, value) => {
        if (!id) {
            return;
        }
        value = value || '';
        const numeric = ~~parseNumber(value);

        if(value === '' || (numeric !== 0 && hasSign(value))) {
            let count = ((await get())[id] || 0) + (numeric || 1);
            return await set(id, count);
        } else if(numeric !== 0 || value === '0') {
            return await set(id, ~~numeric);
        }
    },
    accumulate: async (id, value) => {
        let numericValue = parseNumber(value);
        if (numericValue === 0) {
            return;
        }
        let accumulated = (await get())[id] || 0;
        accumulated += numericValue;
        return await set(id, accumulated);
    },
    reset: async () => {
        for (const {id} of Object.values(config.fields)) {
            storage[id] = 0;
            updateListItem(id, 0)
        }
        await update();
    },
    message: async ({badges, nick, text}) => {
        if (!text) {
            return;
        }
        const [command, ...args] = text.split(' ');
        const normal = normalize(command);
        const field = config.fields[normal]
        const now = new Date().getTime();
        if (field && !onCooldown(field, now) && functions[field.type] && hasPermission(field.permission, badges, nick)) {
            await functions[field.type](field.id, args.join(' '));
            field.lastUsed = now;
        } else if (config.resetCommand.toLowerCase() === normal && hasPermission(config.resetPermission, badges, nick)) {
            await functions.reset();
        }
    }
}

function initContainer() {
    const $container = $('.main-container');
    $container.empty();
    $container.append('<ul class="list"></ul>');
    return $('.list', $container);
}

function toListItem(field, value) {
    let icon = '';
    if (field.icon) {
        icon = `<img src="${field.icon}" height="{{iconSize}}px" width="{{iconSize}}px" alt="${field.label}"/> `;
    }
    return `
    <li>
    <span class="icon-${field.id}">${icon}</span><span class="label-${field.id}">${field.label}:</span> <span class="value-${field.id}">${formatValue(value)}</span></div>
    </li>
    `;
}

function updateListItem(id, value) {
    $(`.value-${id}`).text(formatValue(value));
}

async function buildOverlay() {
    if (!config.fields) {
        return;
    }
    const store = await get();
    const $container = initContainer();
    Object.values(config.fields).sort(({id:l}, {id:r}) => l - r).forEach(field => {
        const value = store[field.id] || 0;
        $container.append(toListItem(field, value));
    });
}

function initConfig(fieldData) {
    const fields = Object.entries(fieldData)
        .filter(([k]) => /^field[0-9].*/.test(k))
        .reduce((acc, [k, v]) => {
            let id = getFieldId(k);
            const field = acc[id] || {};
            field[getFieldSubtype(k)] = v;
            acc[id] = field;
            return acc;
        }, {});

    config.fields = Object.entries(fields).reduce((acc, [k, {command, ...rest}]) => {
        acc[command] = rest;
        acc[command].id = k;
        acc[command].cooldown = 5 * 1000;
        return acc;
    }, {});

    config.decimalPlaces = fieldData.decimalPlaces || config.defaults.decimalPlaces;
    config.resetCommand = normalize(fieldData.resetCommand);
    config.debugMode = fieldData.debugMode;
    config.raw = fieldData;
}

function checkEvent(event) {
    return !!event.detail;
}


window.addEventListener("onWidgetLoad", async (event) => {
    if (!checkEvent(event)) {
        return;
    }
    initConfig(event.detail.fieldData);
    await buildOverlay();
    initialized = true;
})

window.addEventListener('onEventReceived', function (event) {
    if (!initialized || !checkEvent(event)) {
        return;
    }
    const {detail: {event: {data}, listener}} = event;
    if (functions[listener]) {
        functions[listener](data);
    }
});