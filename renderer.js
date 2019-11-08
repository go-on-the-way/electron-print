// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const { ipcRenderer } = require('electron')
//获取打印机列表
function getPrint() {
    console.log('发送获取打印机列表消息');
    ipcRenderer.send('allPrint');
    ipcRenderer.on('printName', (event, data) => {
        console.log(data); //data就是返回的打印机数据列表
        let select = document.getElementById('printOption');
        let selectHtml = '';
        data.forEach(ele => {
            selectHtml += `<option value="${ele.name}">${ele.name}</option>`;
        });
        select.innerHTML = selectHtml;
    });
}

//开始打印
function startPrint() {
    let html = document.getElementById('printContent').innerHTML;
    let select = document.getElementById('printOption');
    let deviceName = select.options[select.selectedIndex].value;
    if (!ipcRenderer) return;
    ipcRenderer.send('print-start', {
        html: html,
        deviceName: deviceName
    });
}