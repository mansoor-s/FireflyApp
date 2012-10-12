'use strict';

var async = require('async');


var Site = module.exports = function( app ) {
	this._app = app;
        this._mongoose = app.get('Mongoose');
        this._sessionManager = app.get('SessionManager');
        
        this._userModel = this._mongoose.model('User');
        this._documentModel = this._mongoose.model('Document');
        
        this._appState = app.get('State');
};




Site.prototype.homeAction = function( req, res ) {
	console.log('in here!');
	console.log(process.pid);
    var session = req.getSession();
    
    var basePath = req.getBasePath().substring(1);
    
    if (basePath.substring(basePath.length - 1) === '/') {
        basePath = basePath.substring(0, basePath.length - 1);
    }
    
    this.findDocument(basePath, function(document) {
        if (!document) {
            res.setStatusCode(404);
            res.render('404.html');
            return;
        }
        
        var view = document.view || 'page.html';
        res.render(view, document);
    });
};





Site.prototype.loginAction = function(req, res) {
    var self = this;
    var fields = req.getFormData().fields;
    
    if (!this.fieldsExist(fields, ['username', 'password'])) {
        res.setStatusCode(401);
        res.render('login.html', {error: 'Incorrect credentials'});
        return;
    }
    
    var userName = fields.username;
    var password = fields.password;
    
    this._userModel.findOne({'username': userName}, function(err, user) {
        if (err) {
            throw err;
            return;
        }
        
        if (!user) {
            res.setStatusCode(401);
            res.render('login.html', {error: 'Incorrect credentials'});
            return;
        }
        
        user.authenticate(password, function(result) {
            if (result === false) {
                res.setStatusCode(401);
                res.render('login.html', {error: 'Incorrect credentials'});
            } else {
                //go to homepage
                console.log('user authenticated!!!');
                self._sessionManager.createSession(res, {groups: ['user', 'admin']}, function() {
                    console.log('in session creation callback');
                    res.redirect('/');
                });
            }
        });
    });
};




Site.prototype.loginPage = function(req, res) {
    res.render('login.html');
};




Site.prototype.fieldsExist = function(fields, fieldNames) {
    var len = fieldNames.length;
    for (var i = 0; i < len; ++i) {
        var name = fieldNames[i];
        if (fields[name] === undefined || fields[name] === '') {
            return false;
        }
    }
    return true;
};





Site.prototype.registerAction = function(req, res) {
    var fields = req.getFormData().fields;
    var fieldNames = [
        'username',
        'password',
        'displayname',
        'email'
    ];
    
    if (!this.fieldsExist(fields, fieldNames)) {
        res.render('register.html', {'error': 'Fields not filled out!'});
    }
    
    console.log('creating new user!');
    var user = new this._userModel({
        'username': fields.username,
        'displayName': fields.displayName,
        'email': fields.email
    });
    
    
    user.setPassword(fields.password, function() {
        user.save(function(err) {
            if(err) {
                res.render('register.html', {'error': 'Something went wrong..'});
            } else {
                res.redirect(req.getReferrer() || '/');
            }
        });
    });
};





Site.prototype.registerPage = function(req, res) {
    res.render('register.html');
};





Site.prototype.profileAction = function(req, res) {
    res.render('profile.html');
}


Site.prototype.findDocument = function(slug, fn) {
    var slugParts = slug.split('/');
    
    if (slugParts.length === 1) {
        this._documentModel.findOne({'slug': slug}, function(err, document) {
            if (err) {
                throw err;
            }
            fn(document);
        });
    } else {
        fn();
    }
};