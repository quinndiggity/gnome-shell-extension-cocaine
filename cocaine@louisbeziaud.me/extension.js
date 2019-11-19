/**
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
**/

'use strict';

const St = imports.gi.St;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Atk = imports.gi.Atk;
const Clutter = imports.gi.Clutter;

const IndicatorName = 'Cocaine';
const DisabledText = '😴';
const EnabledText = '😳';

const InhibitCmd = '/usr/bin/systemd-inhibit --what=idle:sleep:shutdown:handle-power-key:handle-suspend-key:handle-hibernate-key:handle-lid-switch --who=Cocaine --why=Cocaine --mode=block /usr/bin/cat';

let CocaineIndicator;

const Cocaine = GObject.registerClass(
class Cocaine extends PanelMenu.Button {
    _init() {
        super._init(null, IndicatorName);

        this.accessible_role = Atk.Role.TOGGLE_BUTTON;

        this._icon = new St.Label({
            text: DisabledText,
            y_align: Clutter.ActorAlign.CENTER
        });

        this._state = false;

        this._inhibiter_pid = null;

        this.add_actor(this._icon);
        this.add_style_class_name('panel-status-button');
        this.connect('button-press-event', this._toggleState.bind(this));
    }

    _toggleState() {
        this._state = !this._state;

        if (this._state === false) {
            this._stopInhibiter();
            this._icon.text = DisabledText;
        } else if (this._state === true) {
            this._startInhibiter();
            this._icon.text = EnabledText;
        }
    }

    _startInhibiter() {
        let [res, pid, ] = GLib.spawn_async_with_pipes(null, InhibitCmd.split(' '), null, 0, null);
        this._inhibiter_pid = pid;
    }

    _stopInhibiter() {
        if (this._inhibiter_pid) {
            GLib.spawn_async(null, ['/bin/kill', this._inhibiter_pid.toString()], null, 0, null);
            this._in_fd_inhibiter = null;
        }
    }

    destroy() {
        _stopInhibiter();
    }
});

function init() {
}

function enable() {
    CocaineIndicator = new Cocaine();
    Main.panel.addToStatusArea(IndicatorName, CocaineIndicator);
}

function disable() {
    CocaineIndicator.destroy();
    CocaineIndicator = null;
}
