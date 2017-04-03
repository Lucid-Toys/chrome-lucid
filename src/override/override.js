// L U  C   I    D
// Daniel Eden wrote this code
// He also happened to write this ode
// To focus, clarity, rest, and joy
// Which, I hope, you find in this toy

// Define global funcs
function findDaylight(lat, lng) {
  return new Promise(function(resolve, reject) {
    let request = new XMLHttpRequest()
    request.open('GET', `http://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`)
    request.responseType = 'json'

    request.onload = function() {
      if (request.status === 200) {
        resolve(request.response)
      } else {
        reject(Error('Couldn\'t find daylight; error code:' + request.statusText))
      }
    };

    request.onerror = function() {
        reject(Error('Couldn\'t find daylight. There was a network error.'))
    };

    request.send()
  });
}

function findDaylightAndAct(now, lat, lng, storeKey) {
  findDaylight(lat, lng)
  .then(res => res.results)
  .then(daylight => {
    let sunrise = new Date(daylight.sunrise)
    let sunset = new Date(daylight.sunset)

    if(now < sunrise || now > sunset) {
      toggleDaylight(false, true, storeKey)
    } else {
      toggleDaylight(true, true, storeKey)
    }
  })
}

function toggleDaylight(isLight, update, storeKey) {
  let d = document.documentElement

  if(isLight) {
    d.classList.remove('night')
  } else {
    d.classList.add('night')
  }

  if(update) updateStore(storeKey, Object.assign({
    "isNight": !isLight,
  }, readStore(storeKey)))
}

function updateStore(storeKey, data) {
  localStorage.setItem(storeKey, JSON.stringify(data))
}

function readStore(storeKey) {
  const d = localStorage.getItem(storeKey)

  if(d === undefined || d === null) {
    return Error()
  } else {
    return JSON.parse(localStorage.getItem(storeKey))
  }
}

function init(data) {
  toggleDaylight(!data.isNight)
}

// Set up constants
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const months = ['January', 'February', 'March', 'April',
                'May', 'June', 'July', 'August',
                'September', 'October', 'November', 'December']

const key = 'rhugtkeldibnridrlerlgcrrdvneevit'

// Set up the store for our data
// We want to track the notepad's contents and whether or not the human's current
// location is in darkness.
let defaultData = {
  "notepadContent": "",
  "isNight": false,
  "location": {
    "lat": null,
    "lng": null,
  },
}

let data = null

// >= v0.0.3 uses an object to store notepad content, so
// provide a fallback for older versions
try {
  data = readStore(key)
} catch(e) {
  data = defaultData
  data.notepadContent = localStorage.getItem(key)
  updateStore(key, data)
}

// Greet the human
let now = new Date()
let timeString = `${weekdays[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`
let broadTime = now.getHours() < 12 ?
                'morning' :
                now.getHours() > 17 ?
                'evening' : 'afternoon'

let g = document.querySelector('.greeting')
g.innerHTML = `Good ${broadTime}. It is ${timeString}.`

// Set up the notepad
let n = document.querySelector('.notepad')
n.innerHTML = data["notepadContent"]

n.addEventListener('input', e => {
  if(n !== document.activeElement || !windowIsActive) return

  let obj = Object.assign(data, {
    notepadContent: n.value
  })

  updateStore(key, obj)
})

// Allow updating content between tabs
let windowIsActive

let storeListener = setInterval(() => {
  n.innerHTML = readStore(key).notepadContent
}, 1000)

window.onfocus = function () {
  windowIsActive = true
}

window.onblur = function () {
  windowIsActive = false
  storeListener = setInterval(() => {
    n.innerHTML = readStore(key).notepadContent
  }, 1000)
}

n.addEventListener('blur', e => {
  storeListener = setInterval(() => {
    n.innerHTML = readStore(key).notepadContent
  }, 1000)
})

n.addEventListener('focus', e => {
  if(storeListener) {
    clearInterval(storeListener)
  }
})

// Initialise the view
init(data)

// Find the human's location and detect sunlight if necessary
if("geolocation" in navigator) {
  if(data.location && data.location.lat !== null && data.location.lng !== null) {
    findDaylightAndAct(now, data.location.lat, data.location.lng, key)
  } else {
    navigator.geolocation.getCurrentPosition(position => {
      data.location = {
        "lat": position.coords.latitude,
        "lng": position.coords.longitude,
      }

      updateStore(key, data)

      findDaylightAndAct(now, data.location.lat, data.location.lng, key)
    })
  }
}
