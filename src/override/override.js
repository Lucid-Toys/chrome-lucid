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

  if(update) {
    readStore(storeKey, d => {
      updateStore(storeKey, Object.assign({
        "isNight": !isLight,
      }, d))
    })
  }
}

function updateStore(storeKey, data) {
  let obj = {}
      obj[storeKey] = JSON.stringify(data)
  chrome.storage.sync.set(obj)
}

function readStore(storeKey,cb) {
  chrome.storage.sync.get(storeKey, result => {
    let d = null

    if(result[storeKey])
      d = JSON.parse(result[storeKey])

    // Make sure we got an object back, run callback
    if( typeof(d) === 'object' )
      cb(d)
  });
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

// >= v0.0.3 uses an object to store notepad content
// >= v0.0.6 uses chrome sync to store notepad content
// provide a fallback for older versions
readStore(key, d => {
  let data

  // Check if we got data from the chrome sync storage, if so, no fallback is needed
  if(d) {
    data = d
  }
  else
  {
    // Get the local storage
    local = localStorage.getItem(key)

    // Check if we got local storage data
    if(local) {
      // Try parsing the local storage data as JSON.
      // If it succeeds, we had an object in local storage
      try {
        data = JSON.parse(local)
        updateStore(key,local)
      }
      // If it fails to parse, we had the notepad content in local storage
      catch(e) {
        data = defaultData
        data.notepadContent = localStorage.getItem(key)
        updateStore(key, data)
      }

      // Delete the local storage
      localStorage.removeItem(key)
    }

    // If we couldn't get data from anywhere, set to default data
    if( ! data ) {
      data = defaultData
    }
  }

  start(data)
})

function listenerUpdate() {
  readStore(key, d => {
    document.querySelector('.notepad').innerHTML = d.notepadContent
  })
}

function start(data) {
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

  let storeListener = setInterval(listenerUpdate, 1000)

  window.onfocus = function () {
    windowIsActive = true
  }

  window.onblur = function () {
    windowIsActive = false
    if(storeListener) {
      clearInterval(storeListener)
    }
    storeListener = setInterval(listenerUpdate, 1000)
  }

  n.addEventListener('blur', e => {
    if(storeListener) {
      clearInterval(storeListener)
    }
    storeListener = setInterval(listenerUpdate, 1000)
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
}
