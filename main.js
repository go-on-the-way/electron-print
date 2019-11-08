// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { pageUrl } = require('./config')
const io = require('socket.io')();
const { WebsoketServer } = require('./websoket');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, printWindow, printNum = 0;

//创建websoket服务
let ws = new WebsoketServer(io);
ws.listen(7385, (client) => {
  client.on('print', function (data) {
    console.log('received print order');
    printWindow.webContents.send('print-edit', data);
  });
});

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    autoHideMenuBar: true,
    title: '协同任务管理系统',
    icon: './favicon.ico',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  //远程页面嵌入
  // mainWindow.loadURL(pageUrl).then(() => { }, () => {
  //   console.log('load page failed')
  // })

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  //与子页面建立通信
  ipcMain.on('close', e => {
    mainWindow.close();
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
    printWindow.close();   //这个地方很关键，不要放到close中去关闭，不然打包后关闭客户端会报错；
    printWindow = null;
  })
}

//打印设置(窗口打印)
function createPrintWindow() {
  printWindow = new BrowserWindow({
    title: '打印',
    show: false,
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, //开启渲染进程中调用模块  即require
    }
  })
  printWindow.loadFile('./print/print.html');
  initPrintEvent()
}

//打印事件初始化
function initPrintEvent() {
  ipcMain.on('print-start', (event, obj) => {
    console.log('print-start')
    printWindow.webContents.send('print-edit', obj);
  })
  //获得打印机列表
  ipcMain.on('allPrint', () => {
    console.log('received getPrinters msg');
    const printers = printWindow.webContents.getPrinters();
    mainWindow.send('printName', printers)
  })
  ipcMain.on('do', (event, deviceName) => {
    const printers = printWindow.webContents.getPrinters();
    printers.forEach(element => {
      if (element.name === deviceName && element.status != 0) {
        mainWindow.send('print-error', deviceName + '打印机异常');
        printWindow.webContents.print({
          silent: false,
          printBackground: false,
          deviceName: ''
        },
          (data) => {
            console.log("回调", data);
          });
      } else if (element.name === deviceName && !element.status) {
        console.log(element.status + '-' + deviceName)
        printWindow.webContents.print({
          silent: true,
          printBackground: false,
          deviceName: element.name
        }, (success, failureReason) => {
          if (success) {
            console.log('print success')
          }
          if (failureReason === 'cancelled') {
            console.log('print cancelled');
          }
          if (failureReason === 'failed') {
            console.log('print failed');
          }
        });
      }
    });

  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  createPrintWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
