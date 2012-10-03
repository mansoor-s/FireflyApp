module.exports = {
    'loginAction': {
        pattern: 'login',
        controller: 'loginAction',
        requirements: {
            _method: 'POST'
        }
    },
    
    'loginPage': {
        pattern: 'login',
        controller: 'loginPage'
    },
    
    'registerAction': {
        pattern: 'register',
        controller: 'registerAction',
        requirements: {
            _method: 'POST'
        }
    },
    
    'registerPage': {
        pattern: 'register',
        controller: 'registerPage'
    },
    
    'profile': {
        pattern: 'profile',
        controller: 'profileAction'
    },
    
    'site_home': {
        pattern: ':slug',
        controller: 'homeAction'
    }
};