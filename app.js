/*
    Firefly - Node.js Framework
    Copyright (C) <2012>  <Mansoor Sayed>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

var cluster         = require( 'cluster' );
var numCPUs         = require('os').cpus().length;

var Firefly         = require( '../Firefly/' );
var AppConfig       = require( './AppConfig.js' );
var routes          = require( './Routes.js' );

var HandleBars      = require( './services/Renderer/Handlebars.js' );
var Redis           = require( './services/Database/Reids.js' );
var SessionManager  = require( './services/Security/SessionManager.js' );
var Permission      = require( './services/Security/Permission.js' );
var Mongoose        = require( './services/Database/Mongoose.js' );
var Mailer          = require( './services/Mailer/Mailer.js' );
var State           = require( './services/State/State.js' );


//new instance of Firefly
var app = new Firefly( routes, AppConfig );


//set up renderer. wrapper for Handlebars
var handlebars = new HandleBars(app);

app.setViewEngine(handlebars);

var Redis = new Redis(app);

var sessionManager = new SessionManager(app);
var permission = new Permission(app);


var mongoose = new Mongoose(app);

var state = new State(app);


if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        var worker = cluster.fork();
        worker.on('message', function(msg) {
            console.log(msg);
        });
    }

    cluster.on('death', function(worker) {
        console.log('worker ' + worker.pid + ' died');
        cluster.fork();
    });
    
} else {
    //Initialize 
    app.init(function() {
        process.send('Server Started');  
    });
}