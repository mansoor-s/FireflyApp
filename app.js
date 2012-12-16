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

var Firefly         = require( 'firefly' );
var AppConfig       = require( './AppConfig.js' );
var routes          = require( './Routes.js' );

var HandleBars      = require( 'firefly-handlebars' );
var Redis           = require( 'firefly-redis' );
var SessionManager  = require( 'firefly-redis-session' );
var Permission      = require( 'firefly-permission' );
var Mongoose        = require( '../firefly-mongoose/firefly-mongoose.js' );
var Mailer          = require( 'firefly-mailer' );
//var State           = require( './services/State/State.js' );


//new instance of Firefly
var app = new Firefly( routes, AppConfig );


//set up renderer. wrapper for Handlebars
var handlebars = new HandleBars(app);

app.setViewEngine(handlebars);

var Redis = new Redis(app);

var sessionManager = new SessionManager(app);
var permission = new Permission(app);


var mongoose = new Mongoose(app);

//var state = new State(app);


//Initialize 
app.init(function() {
    console.log('Server Started');  
});
