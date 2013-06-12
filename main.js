/*
    This file is part of Ironbane MMO.

    Ironbane MMO is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Ironbane MMO is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Ironbane MMO.  If not, see <http://www.gnu.org/licenses/>.
*/
var pkg = require('./package.json'),
    config = require('./nconf'),
    log = require('util').log; // built in timestampped logger
/*
// Mysql config
var mysql_user = config.get('mysql_user');
var mysql_password = config.get('mysql_password');
var mysql_database = config.get('mysql_database');
var clientDir = config.get('clientDir');

// System start
var SERVER = true;
var params = {
    log: 0
};

//
// For running locally, don't use for production
params.log = 0;
params['close timeout'] = 86400;
params['heartbeat timeout'] = 86400;
params['heartbeat interval'] = 86400;
params['polling duration'] = 86400;
//

var io = require('socket.io').listen(config.get('server_port'), params);
var mmysql = require('mysql');
var fs = require('fs');
var spawn = require('child_process').spawn;
var window = {};

// Custom
var NameGen = require('./External/namegen');
var wrench = require('wrench');
var util = require('util');

var fsi = require('./External/fsi.js');
var check = require('./External/validator.js').check;
var sanitize = require('./External/validator.js').sanitize;
var _ = require('underscore');

// Everything runs on one database, since the db is not hurt that bad by performance
// We cut the middle man and only use mysql occasionally to save/load data

// Start MySQL
var mysql = mmysql.createConnection({
    user: mysql_user,
    password: mysql_password,
    database: mysql_database
    //insecureAuth:false
});

// Necessary to prevent 'Mysql has gone away' errors
// Use it check for restarting on git push
var shuttingDown = false;

function keepAlive() {
    //mysql.query('SELECT 1');
    if (shuttingDown) {
        return;
    }

    mysql.query('SELECT value FROM ib_config WHERE name = ?', ["restart"], function(err, results, fields) {
        if (err) {
            throw err;
        }

        if (results.length) {
            shuttingDown = true;

            chatHandler.Announce("&lt;Server&gt; New update available!", "red");
            chatHandler.Announce("&lt;Server&gt; Auto-restarting in 10 seconds...", "red");

            setTimeout(function() {
                mysql.query('DELETE FROM ib_config WHERE name = ?', ["restart"], function(err, results, fields) {
                    if (err) {
                        throw err;
                    }

                    process.exit();
                });
            }, 10000);
        }

    });
    return;
}
setInterval(keepAlive, 10000);

var includes = [

    './Engine/Vector3.js',
    './Engine/Util.js',

    './Init.js',

    './External/Shared.js',
    './External/Util.js',
    './External/NodeHandler.js',

    './External/perlin.js',

    './External/ImprovedNoise.js',


    './Engine/ConsoleCommand.js',
    './Engine/ConsoleHandler.js',

    './Engine/Switch.js',

    './Engine/SocketHandler.js',
    './Engine/WorldHandler.js',
    './Engine/DataHandler.js',
    './Engine/ChatHandler.js',

    './Game/AI/graph.js',
    './Game/AI/astar.js',
    './Game/AI/Telegram.js',
    './Game/AI/MessageDispatcher.js',
    './Game/AI/State.js',
    './Game/AI/StateMachine.js',

    './Game/AI/MonsterScripts.js',

    './Game/AI/States/ChaseEnemy.js',
    './Game/AI/States/ExploreAndLookForEnemies.js',
    './Game/AI/States/NPCGlobalState.js',
    './Game/AI/States/EmptyState.js',
    './Game/AI/States/SellMerchandise.js',
    './Game/AI/States/Turret.js',
    './Game/AI/States/TurretStraight.js',
    './Game/AI/States/TurretKillable.js',
    './Game/AI/States/Wander.js',


    './Game/SteeringBehaviour.js',
    './Game/Unit.js',
    './Game/MovingUnit.js',
    './Game/Actor.js',
    './Game/Fighter.js',
    './Game/NPC.js',
    './Game/Lootable.js',
    './Game/Player.js',

    './Game/Special/MovingObstacle.js',
    './Game/Special/ToggleableObstacle.js',
    './Game/Special/Train.js',
    './Game/Special/Lever.js',
    './Game/Special/TeleportEntrance.js',
    './Game/Special/TeleportExit.js',
    './Game/Special/Sign.js',
    './Game/Special/HeartPiece.js',
    './Game/Special/MusicPlayer.js',

    './Server.js'


];

for (var f = 0; f < includes.length; f++) {
    log("Loading: " + includes[f]);
    eval(fs.readFileSync(includes[f]) + '');
}*/

// create game server, do it first so that the other 2 "servers" can query it
var IronbaneGame = require('./src/server/game');

// create web server
var HttpServer = require('./src/server/http/server').Server,
    httpServer = new HttpServer({game: IronbaneGame});

// create socket server
var SocketServer = require('./src/server/socket/server').Server,
    socketServer = new SocketServer({httpServer: httpServer.server, game: IronbaneGame});

// start Ironbot the IRC minion
/*
var ircConfig = config.get('irc'),
    Ironbot = null;
if(ircConfig.enabled) {
    Ironbot = require('./src/server/irc/bot');
    // todo: move to another file
    Ironbot.addListener('message', function(from, to, message) {
        if ( to.match(/^[#&]/) ) {
            if(message === 'uptime') {
                Ironbot.say(to, 'Server uptime: ' + IronbaneGame.getUpTime());
            }
        }
    });
}
*/
// setup REPL for console server mgmt
var startREPL = function() {
    var repl = require('repl'); // native node

    // Not game stuff, this is for the server executable
    process.stdin.setEncoding('utf8');

    // startup a full node repl for javascript awesomeness
    var serverREPL = repl.start({
        prompt: "ironbane> ",
        input: process.stdin,
        output: process.stdout
    });

    serverREPL.on('exit', function() {
        // todo: other shutdown stuff, like stop db, etc.
        process.exit();
    });

    // repl commands start with a dot i.e. ironbane> .exec
    serverREPL.defineCommand('exec', function(text) {
        //consoleHandler.exec(text);
    });

    // context variables get attached to "global" of this instance
    serverREPL.context.version = pkg.version;
    serverREPL.context.game = IronbaneGame;
   // serverREPL.context.ircbot = Ironbot;
};
// start it up, todo: only per config?
startREPL();