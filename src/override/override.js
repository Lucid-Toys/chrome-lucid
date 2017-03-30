let key = 'rhugtkeldibnridrlerlgcrrdvneevit'
let n = document.querySelector('.notepad')
let g = document.querySelector('.greeting')

let now = new Date()
let weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

let months = ['January', 'February', 'March', 'April',
              'May', 'June', 'July', 'August',
              'September', 'October', 'November', 'December']

let timeString = `${weekdays[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`

g.innerHTML = `Good ${now.getHours() < 12 ? 'morning' : 'afternoon'}. It is ${timeString}.`

n.innerHTML = localStorage.getItem(key)

n.addEventListener('input', e => {
  localStorage.setItem(key, n.value)
})
