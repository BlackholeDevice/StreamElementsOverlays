/* globals StreamerbotClient, $ */
const version = '2.0.1';
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
          "eventType": 'Actor Death',
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
    'Vehicle Destruction': 'ship',
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

  return `<img src="${icon}" alt="kill icon" height="${config.fontSize}">`;
}

function parseKillMessage(data) {
  const killType = getKillType(data);
  const text = config[`${killType}Text`] || config.otherText;
  data.icon = getIcon(config[`${killType}Icon`] || config.otherIcon);
  return Object.entries(data).reduce((res, [k, v]) => res.replace(`{${k}}`, v), text);
}

function generateElement(data) {
  return `<span class="slide">${parseKillMessage(data)}</span>`;
}

function isDupe(victim, now) {
  return dupeFix[victim] && (now - dupeFix[victim]) <= 2000;
}

function isNPC({victimIsNpc}) {
  return config.showNpcs && victimIsNpc
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

function isAllowedPlayer({attacker, victim}) {
  return !config.shouldFilter || !config.filter.length || config.filter.includes(attacker.toLowerCase()) || config.filter.includes(victim.toLowerCase());
}

function addElement(element) {
  const $element = $(element);
  $('#main-container').prepend($element);
  const ms = 1000;
  const fadeTime = config.fadeTime * ms;
  setTimeout(() => $element.removeClass('slide').addClass('fade'), fadeTime);
  setTimeout(() => $element.remove(), fadeTime + ms);
}

const eventHandlers = {
  'Actor Death': (data) => {
    if(isNpcOrDupe(data)) {
      return;
    }
    if(!isAllowedPlayer(data)) {
      return;
    }
    addElement(generateElement(data));
  }
};

async function checkVersion() {
  try {
    const remoteVersion = await fetch('https://raw.githubusercontent.com/BlackholeDevice/StreamElementsOverlays/refs/heads/main/public/kill-feed/version.txt');
    const remote = (await remoteVersion.text()).trim().split('.');
    const local = version.split('.');
    let remoteNewer = false;
    for (let i = 0; !remoteNewer && i < Math.max(remote.length, local.length); i++) {
      remoteNewer = +(remote[i] || 0) > +(local[i] || 0);
    }
    if(remoteNewer) {
      addElement(`<span class="slide">Overlay update available [current: ${version}, new: ${remote}]</span>`);
    }
  } catch {
  }
}

function updateConfig(fieldData) {
  config = fieldData;
  if(fieldData.filter) {
    config.filter = fieldData.filter.toLowerCase().replaceAll(/\s+/g, '').split(',') || [];
  }
}

window.addEventListener("onWidgetLoad", async (event) => {
  if (!checkEvent(event)) {
    return;
  }
  updateConfig(event.detail.fieldData);
  await checkVersion()
  const client = new socketModes[config.socketMode]({
    host: config.socketHost,
    port: config.socketPort,
    endpoint: config.socketEndpoint,
    subscribe: 'General.Custom'
  });
  client.on('General.Custom', ({data: {eventType, ...data}}) => {
    if (!eventType || !eventHandlers[eventType]) {
      return;
    }

    eventHandlers[eventType](data);
  });
})
