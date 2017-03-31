let key = 'rhugtkeldibnridrlerlgcrrdvneevit'
let n = document.querySelector('.notepad')
let g = document.querySelector('.greeting')

let now = new Date()
let weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

let months = ['January', 'February', 'March', 'April',
              'May', 'June', 'July', 'August',
              'September', 'October', 'November', 'December']

let timeString = `${weekdays[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`
let broadTime = now.getHours() < 12 ? 'morning' : now.getHours() > 17 ? 'evening' : 'afternoon'

g.innerHTML = `Good ${broadTime}. It is ${timeString}.`

n.innerHTML = localStorage.getItem(key)

n.addEventListener('input', e => {
  localStorage.setItem(key, n.value)
})
