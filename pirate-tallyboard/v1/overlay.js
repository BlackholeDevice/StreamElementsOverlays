const OVERLAY_ID = '7dceda52-7bc3-4ca6-9a1f-21f2d644afc7-asd3';
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
        storage = res && res.value || {};
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

function parseNumber(value) {
    value = `${value || 0}`;
    if (!value) {
        return 0;
    }
    const [match] = value.match(/^([0-9]*[.])?[0-9]+/);
    let numeric = parseFloat(match);
    if (match && numeric > 0) {
        const [multiMatch] = value.match(/\.*[a-z]+$/i) || ['o'];
        const multiplier = config.multipliers[multiMatch] || 1;
        numeric *= multiplier;
        return numeric;
    }
    return 0;
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
    console.log('badgeValue', badgeValue);
    return badgeValue;
}

function getPermissions(badges) {
    const badgeList = (Object.keys(badges).length > 0) ? badges.map(badge => badge.type.toLowerCase()): [];
    return getHighestBadgeLevel(badgeList) || PERMISSIONS.everyone;
}

function hasPermission(permission, badges) {
    console.log('permission', permission);
    return getPermissions(badges) <= PERMISSIONS[permission];
}

const functions = {
    counter: async (id, value) => {
        if (!id) {
            return;
        }
        value = value || undefined;
        const numeric = parseNumber(value);
        console.log(value,numeric);
        if(value === undefined || numeric < 0) {
            let count = ((await get()[id]) || 0) + 1;
            return await set(id, count);
        }
        return await set(id, ~~numeric);
    },
    accumulate: async (id, value) => {
        let numericValue = parseNumber(value);
        if (numericValue <= 0) {
            return;
        }
        let accumulated = (await get())[id] || 0;
        accumulated += numericValue;
        return await set(id, accumulated);
    },
    reset: async () => {
        const value = 0;
        const promises = [];
        for (const {id} of Object.values(config.fields)) {
            storage[id] = 0;
            updateListItem(id, 0)
        }
        await update();
    },
    message: async ({badges, text}) => {
        if (!text) {
            return;
        }
        const [command, ...args] = text.split(' ');
        const normal = normalize(command);
        const field = config.fields[normal]
        if (field && functions[field.type] && hasPermission(field.permission, badges)) {
            await functions[field.type](field.id, args.join(' '));
        } else if (config.resetCommand.toLowerCase() === normal) {
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
        return acc;
    }, {});

    config.decimalPlaces = fieldData.decimalPlaces || config.defaults.decimalPlaces;
    config.resetCommand = normalize(fieldData.resetCommand);
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