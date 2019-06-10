const request = require('request');

module.exports = function() {
    return {
        post: async (path, data) => {
            return new Promise(res => {
                request.post(
                    `${this.pathApi}/${path}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept-Language': 'en',
                            Authorization: this.token
                        },
                        body: JSON.stringify(data)
                    },
                    function(error, response, body) {
                        res(JSON.parse(body));
                    }
                );
            });
        },
        put: async (path, data) => {
            return new Promise(res => {
                request.put(
                    `${this.pathApi}/${path}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept-Language': 'en',
                            Authorization: this.token
                        },
                        body: JSON.stringify(data)
                    },
                    function(error, response, body) {
                        res(JSON.parse(body));
                    }
                );
            });
        },
        delete: async (path, data) => {
            return new Promise(res => {
                request.delete(
                    `${this.pathApi}/${path}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept-Language': 'en',
                            Authorization: this.token
                        },
                        body: JSON.stringify(data)
                    },
                    function(error, response, body) {
                        res(JSON.parse(body));
                    }
                );
            });
        },
        get: async (path, data) => {
            const querystring = require('querystring');
            return new Promise(res => {
                request.get(
                    `${this.pathApi}/${path}?${querystring.stringify(data)}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept-Language': 'en',
                            Authorization: this.token
                        }
                    },
                    function(error, response, body) {
                        res(JSON.parse(body));
                    }
                );
            });
        },
        adminToken: async() => {
            return new Promise(res => {
                request.post(
                    `${this.pathApi}/user/auth/`,
                    {
                        body: JSON.stringify({
                            email: 'super_admin@admin.com',
                            password: 'viralworks@2018'
                        }),
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept-Language': 'en'
                        }
                    },
                    function(error, response, body) {
                        res({
                            error: error,
                            body: JSON.parse(body)
                        });
                    }
                );
            });
        },
        kolToken: async(data) => {
            return new Promise(res => {
                request.post(
                    `${this.pathApi}/kol/login/`,
                    {
                        body: JSON.stringify(data),
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept-Language': 'en'
                        }
                    },
                    function(error, response, body) {
                        res({
                            error: error,
                            body: JSON.parse(body)
                        });
                    }
                );
            });
        },
        setToken: (token) => {
            this.token = token;
        },
        setPathApi: (url) => {
            this.pathApi = url;
        }
    };
};

