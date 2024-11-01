const { app, BrowserWindow, Menu } = require('electron');
const path = require('node:path');

let mainWindow;

if (require('electron-squirrel-startup')) {
  app.quit();
}

//Create the main application window
const createWindow = () => {
  //Create the browser window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  //Set the application menu
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);

  
  mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

//Menu template 
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Refresh',
        click() {
          mainWindow.webContents.reload(); //Reloads the current page
        },
      },
      {
        label: 'Go Back',
        click() {
          mainWindow.webContents.goBack(); //Go back to the previous page
        },
      },
      {
        label: 'Quit/Exit',
        click() {
          app.quit(); //Exit the application
        },
      },
    ],
  },
];

//In this file you can include the rest of your app's specific main process code.
//You can also put them in separate files and import them here.
