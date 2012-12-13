/*
    Firefly - Node.js CMS
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


var fs = require('fs'),
    path = require('path'),
    mongoose = require('mongoose'),
    dive = require('dive');



/**
* Initialize Mongoose and set it as a service named 'Mongoose' with Firefly
*
* @class Mongoose
* @module Services
* @constructor
* @param {Object} firefly reference to Firefly instance
* @param {Object} opts mongodb connection options
* @param {String} [serviceName='Mongoose'] name for the service
*/
var Mongoose = module.exports = function(firefly, serviceName) {
    if (!firefly) {
        throw Error('`Mongoose` service requires Firefly instance as its first parameters in constructor');
    }

    this.app = firefly;
    this.opts = firefly.config.MongoDB;
    
    this.db = mongoose.createConnection();
    
    this.app.set('Mongoose', this.db);

    this.app.addInitDependency(this._onInit());
};



/**
* The function returned by this method gets called on application init
*
* @method _onInit
* @private
* @return {Function} will return a callback function which itself takes a callback function
*/
Mongoose.prototype._onInit = function() {
    var self = this;
    return function(fn) {
        self.db.open(self.opts.HOST, self.opts.DB_NAME, self.opts.PORT, self.opts.OPTS, function(err) {
            if (err) {
                throw Error('Unable to connect to MongoDB server with error: `' + err + '`');
            }
            

            //initialize models
            self._initModels(fn);
        });
    };
};



/**
* Initialize mongoose models from schema directory
*
* @method _initModels
* @private
* @param {Function} fn callback
*/
Mongoose.prototype._initModels = function(fn) {
    var self = this;
    
    dive(this.app.config.MODELS_DIR, { all: true }, function(err, filePath) {
        if (err) {
            throw err
        }
        
        var filePathParts = filePath.split(path.sep),
            len = filePathParts.length,
            fileName = filePathParts[len - 1],
            nameParts = fileName.split('.');

        if(nameParts.length === 1 ) {
            return;
        }

        var name = nameParts[0],
            ext = nameParts[1];

        if (ext !== 'js') {
            return;
        }

        var schema = require(filePath);
        self.db.model(name, schema);
    }, fn);
};