let key = 'rhugtkeldibnridrlerlgcrrdvneevit'
let n = document.querySelector('.notepad')
let g = document.querySelector('.greeting')
let h = document.querySelector('html')

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
  n.innerHTML = n.value
})

h.addEventListener('keydown', e => {
    if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault()
		var d = `Good ${broadTime}. It is ${timeString}.` 
        d += '\n\n'
        d += n.innerHTML
        d = d.replace(/\r?\n|\r/g, '\r\n')
        download(d, "lucid", "text/plain;charset=utf-8")
    }
}, false)

function download(data, filename, type) {
    var a = document.createElement("a"),
        file = new Blob([data], { type: type })
    var url = URL.createObjectURL(file)
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    setTimeout(function() {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
    }, 0)
}
