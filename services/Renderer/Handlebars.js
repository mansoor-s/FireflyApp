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

var fs = require('fs');
var Handlebars = require('handlebars');

/**
* Wrapper for Handlebars
*
* @class Handlebars
* @module Services
* @constructor
* @param {Object} firefly Reference to the application Firefly object
*/
var Renderer = module.exports = function(firefly) {
    this.app = firefly
   
    this._views = undefined;
    
     /* cache structure:
       
        cache: {
            path: content
        }
    */
    this.cache = {};
    
    //firefly.addInitDependency(this._onInit());
};


/**
* function to be called on application initialization. *Not* registered with firefly.
*   No use for it at this time
*
* @method _onInit
* @private
*/
Renderer.prototype._onInit = function() {
    var self = this;
    return function(fn) {
        fn();
    };
};


/**
* Set an internal map of view names and file paths. This function will call buildCache
* when application is not in `dev` mode
*
* @method setViews
* @param{ Object} views Object containing map of view names and file paths
* @param {Function} fn Callback
*/
Renderer.prototype.setViews = function(views, fn) {
    this._views = views;
    if (this.app.config.ENV !== 'dev') {
        this.buildCache(fn);
    }
    
};



/**
* Build a cache of filepaths and its contents in memory. So not to hit the disk for every request.
*
* @method buildCache
* @param{Object} views Object containing map of view names and file paths
* @param {Function} fn Callback
*/
Renderer.prototype.buildCache = function(fn) {
    for (var i = 0, len = this._views.length; i < len; ++i) {
        var viewPath = this._views[i];
        var data = fs.readFileSync(viewPath, 'utf8');
        var template = Handlebars.compile(data);
        
        this.cache[viewPath] = template;
    }

    fn();
};



/**
* Rebuild cache. Clears the file contents cach and calls buildCache
*
* @method rebuildCache
* @param{Object} views Object containing map of view names and file paths
* @param {Function} fn Callback
*/
Renderer.prototype.rebuildCache = function(fn) {
    this.cache = {};
    this.buildCache(fn);
};



/**
* Render a view
*
* @method render
* @param{String} view file path 
* @param {Object} object to send to handlebars along with template
* @param {Function} fn Callback
*/
Renderer.prototype.render = function(path, opts, fn) {
    var template;
    
    if (this.app.config.ENV === 'dev') {
        fs.readFile(path, 'utf8', function(err, content) {
            template = Handlebars.compile(content);
            fn(template(opts));
        });
    } else {
        template = this.cache[path];
        if (!template) {
            throw new Error('View `' + path + '` not found');
        }
        
        fn(template(opts));
    }
};