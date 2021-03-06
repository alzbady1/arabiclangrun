const Lang = imports.lang;
const Shell = imports.gi.Shell;
const GLib = imports.gi.GLib;
const Main = imports.ui.main;
const PopupMenu = imports.ui.popupMenu;
const Util = imports.misc.util;

const EXTENSION_NAME = "arabiclangrun";
const EXTENSION_AUTHOR = "yucefsourani.github.com";
const DATA_DIRECTORIES = ["/usr", GLib.get_home_dir() + "/.local","/var/lib/flatpak/exports",GLib.get_home_dir() + "/.local/share/flatpak/exports"];


let Aim = imports.ui.appDisplay.AppIconMenu;
let origin;
let launcher_ar = "Launch With Arabic";


function enable() {
    origin = Aim.prototype._redisplay;

    Aim.prototype._redisplay = function () {
        origin.call(this, arguments);
        let i = 1;

        this.addMenuItem(new PopupMenu.PopupSeparatorMenuItem(), _getNewWindowIndex(this) + i);
        ++i;


        _addLauncher(this, launcher_ar, i);

    }
}

function disable() {
    Aim.prototype._redisplay = origin;
}

function _addLauncher(self, name, i) {
    let launcher = new PopupMenu.PopupMenuItem(_(name));

    self.addMenuItem(launcher, _getNewWindowIndex(self) + i);
    launcher.connect("activate", Lang.bind(self, function () {
        if (self._source.app.state == Shell.AppState.STOPPED) {
            self._source.animateLaunch();
        }
	Util.spawnApp(["env LANG=ar_LB.UTF-8",_getCommand(self._source.app.get_id())]);
        self.emit("activate-window", null);
    }));
}

function _getNewWindowIndex(self) {
    let appInfo = self._source.app.get_app_info();
    let windows = self._source.app.get_windows();
    let actions = appInfo.list_actions();

    return self._newWindowMenuItem
        ? self._getMenuItems().indexOf(self._newWindowMenuItem)
        : windows.length + actions.length;
}

function _getCommand(file) {
    for (let i in DATA_DIRECTORIES) {
        try {
            let content = GLib.file_get_contents(DATA_DIRECTORIES[i] + "/share/applications/" + file)[1];
            let line = /Exec=.+/.exec(content)[0];

	    

            return line.substr(5);
        } catch (error) {
            log(error);
        }
    }
}
