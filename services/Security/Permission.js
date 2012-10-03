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

var bcrypt = require('bcrypt');


/**
* Permission system for Firefly
*
* @class Permission
* @module Services
* @constructor
* @param {Object} firefly Reference to the application Firefly object
* @param {String} [serviceName='Permission'] Name with which to register the service with Firefly
*/
var Permission = module.exports = function(firefly, serviceName) {
    serviceName = serviceName || 'Permission';
    
    this._app = firefly;
    this._app.set(serviceName, this);
    
    this._cookieName = firefly.config.SESSION_COOKIE_NAME;
    //firefly.addInitDependency(this._onInit());
    
    firefly.router.addRouteRequirement('authenticated', this._getAuthenticatedChecker());
    firefly.router.addRouteRequirement('verified', this._getVerifiedChecker());

    
    this.sessionManager = firefly.get('SessionManager');
};



/**
* function to be called on application initialization. *Not* registered with firefly.
*
* @method _onInit
* @private
*/
Permission.prototype._onInit = function() {
    var self = this;
    return function(fn) {
        fn();
    };
};



/**
* Returns a function that checks to make sure user is authenticated
*
* @method _getAuthenticatedChecker
* @private
* @return {Function} fn
*
* @example
*       //the function returned takes four parameters:
        function(request, response, rule, fn) {
            
        }
*/
Permission.prototype._getAuthenticatedChecker = function() {
    var self = this;

    return function(request, response, rule, fn) {
        self.hasValidSession(request, function(isValid) {
            if (isValid === true && rule === true) {
                fn(true, false);
            } else if (isValid === false && rule === false) {
                fn(true, false);
            } else {
                response.redirect('/login');
                fn(false, true);
            }
        });
    };
};



/**
* Returns a function that checks to make sure user is verified (Email.. or any other means)
*
* @method _getVerifiedChecker
* @private
* @return {Function} fn
*
* @example
*       //the function returned takes four parameters:
        function(request, response, rule, fn) {
            
        }
*/
Permission.prototype._getVerifiedChecker = function() {
    var self = this;
    //fn takes  ruleSatisfied and end
    return function(request, response, rule, fn) {
        self.hasValidSession(request, function(isValid, session) {
            var verified;
            if(isValid === true) {
                verified = session.verified;
                if (verified === true && rule === true) {
                    fn(true, false);
                } else if (verified === false && rule === false) {
                    fn(true, false);
                } else {
                    //redirect insuficient privilages
                    fn(false, true);
                }
            } else {
                //redirect insuficient privilages
                fn(false, true)
            }
        });
    };
};


/**
* Checks if client has a valid session
*
* @method hasValidSession
* @param {Object} request Reference to request object
* @param {Function} callback function which will take a boolean as its argument.
*   The argument will be true if the session is valid, otherwise false
*/
Permission.prototype.hasValidSession = function(request, fn) {
    var sessId = request.getCookie(self._cookieName);

    if (sessId) {
        fn(false)
    } else {
        this.sessionManager.getSession(request, function(session) {
            if (session) {
                fn(true, session);
            } else {
                fn(false);
            }
        });
    }
};