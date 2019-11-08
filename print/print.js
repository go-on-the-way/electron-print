const { ipcRenderer } = require('electron');
const { deviceName } = require('../config')
ipcRenderer.on('print-edit', (event, obj) => {
    console.log('打印页接收到print-edit');
    let html = '';
    html += `<div>${obj.html}</div>`
    document.body.innerHTML = html;
    // ipcRenderer.send('do', obj.deviceName);
    ipcRenderer.send('do', deviceName);
});
