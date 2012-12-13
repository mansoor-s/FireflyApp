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



/**
* Handles application state and persists to Mongo.
*
* @class State
* @module Services
* @constructor
* @param {Object} firefly reference to the application Firefly object
* @param {Object} defaults 
*/
var StateManager = module.exports = function(firefly, defaults, serviceName) {
    this._firefly = firefly;
    
    var mongoose = firefly.get('Mongoose');
    
    this._stateModel = mongoose.model('State');
    
    firefly.router.addRouteRequirement('state', this._getStateInjecter());
    
    firefly.set('StateManager', this);
    
    this._state = undefined;
    
    Object.seal(this);
};


StateManager.prototype._onInit = function() {
    var self = this;
    return function(fn) {
        self._stateModel.findOne({}, function(err, state) {
            if (err) {
                throw err;
            }
            
            if (!state) {
                state = new self._stateModel(defaults);
                state.save(function(err) {
                    if(err) {
                        throw err;
                    }
                    
                    fn();
                });
            }else {
                fn();
            }
        });
    };
};


StateManager.prototype._getStateInjecter = function() {
    var self = this;
    return function(request, response, rule, fn) {
        if (rule === true) {
            request.setAppState(self);
            fn(true);
        } else {
            fn(false);
        }
    };
};

StateManager.prototype.get = function( fn ) {
    return this._state[prop];
};


StateManager.prototype.persist = function( fn ) {
    
};


StateManager.prototype.update = function( fn ) {
    
};