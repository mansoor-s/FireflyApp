var Routes = module.exports = {
    'Site': {
        basePattern: '/',
        applet: 'Site',
		requirements: {
			_session: true
		}
    },

    'Admin': {
    	basePattern: 'admin',
    	applet: 'Admin',
    	requirements: {
    	    _usergroup: 'admin'
    	}
    }
};
