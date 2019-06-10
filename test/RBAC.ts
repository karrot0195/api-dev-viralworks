import * as assert from 'assert';
import * as request from 'request';
import * as readline from 'readline';
import * as _ from 'lodash';
import { expect } from 'chai';
import { guestAPI, GuestAndAuthenOnlyAPI } from './API';

let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);

// Get super admin username/password
// ----------------------------------------------------------------------------

let superAdmin = {
    email: 'super_admin@admin.com',
    password: 'viralworks@2018',
    token: ''
};

let user: any = {
    name: 'White Mouse',
    email: 'white.mouse@3450983059345.viralworks.com',
    password: 'String12',
    id: ''
};

let serverUrl = 'http://0.0.0.0:8080/v1.0';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

before(async function login() {
    this.timeout(0);

    superAdmin.email =
        (await new Promise(resolve => {
            rl.question('Super Admin email? (Enter for default)', answer => {
                resolve(answer);
            });
        })) || superAdmin.email;

    superAdmin.password =
        (await new Promise(resolve => {
            rl.question('Super Admin password? (Enter for default)', answer => {
                resolve(answer);
            });
        })) || superAdmin.password;

    // serverUrl =
    //     (await new Promise(resolve => {
    //         rl.question('Server API basepath? (Enter for default)', answer => {
    //             resolve(answer);
    //         });
    //     })) || serverUrl;

    rl.close();
    console.log();
});

// Test
// ----------------------------------------------------------------------------

let adminLogin: any;
let adminHeader = { Authorization: '' };
let userLogin: any;
let userHeader = { Authorization: '' };
let paths: any;
let faqRoleId = '';
let packPermsId = '';
let customRoleId = '';

describe('Super Admin Login', async function() {
    before(function login(done) {
        chai.request(serverUrl)
            .post('/user/auth')
            .send(superAdmin)
            .end(function(err, res) {
                adminLogin = { res, err, body: JSON.parse(res.text) };
                done();
            });
    });

    it('should be successful', async function() {
        expect(adminLogin.err).to.be.null;
        expect(adminLogin.res).to.have.status(200);
    });

    it('should return a token', async function() {
        adminHeader.Authorization = adminLogin.body.token;

        expect(adminLogin.body.token).to.be.an('string').that.is.not.empty;
    });

    it('should return Global Administrator as first role', async function() {
        expect(adminLogin.body.info.roles[0].name).equal('Global Administrator');
    });

    it('should be able to call API /rbac/paths', function(done) {
        chai.request(serverUrl)
            .get('/rbac/paths')
            .set(adminHeader)
            .end(function(err, res) {
                expect(err).to.be.null;

                expect(res).to.have.status(200);

                paths = JSON.parse(res.text);

                done();
            });
    });

    it('should have permission list length equals paths length', async function() {
        expect(adminLogin.body.permissions.length).to.be.at.least(paths.length);
    });
});

// ----------------------------------------------------------------------------

describe('Guest', async function() {
    it('should not be able to call any API but APIs for guest', async function() {
        this.timeout(0);

        let totalAccessAPI: any = 0;

        for (let path of paths) {
            totalAccessAPI += await new Promise(resolve => {
                chai.request(serverUrl)
                    [path['method']](path['path'])
                    .end(function(err, res) {
                        let accessable = 1;

                        if (res.status === 401 || res.status === 403) accessable = 0;

                        if (_.find(guestAPI, o => o.path === path.path && o.method === path.method)) accessable = 0;

                        resolve(accessable);
                    });
            });
        }

        expect(totalAccessAPI).equal(0);
    });
});

// ----------------------------------------------------------------------------
describe('Creating new user with empty role', async function() {
    describe('Super Admin', async function() {
        it('should able to create new user White Mouse with no role', function(done) {
            chai.request(serverUrl)
                .post('/user/users')
                .set(adminHeader)
                .send(user)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(201);

                    user.id = JSON.parse(res.text)._id;

                    done();
                });
        });
    });

    describe('New user White Mouse', async function() {
        it('should be able to login', function(done) {
            chai.request(serverUrl)
                .post('/user/auth')
                .send(user)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);

                    userLogin = { res, err, body: JSON.parse(res.text) };

                    userHeader.Authorization = userLogin.body.token;

                    done();
                });
        });

        it('should have an empty permission list', function() {
            expect(userLogin.body.permissions.length).equal(0);
        });

        it('should not be able to call any API but APIs without authorization', async function() {
            this.timeout(0);

            let totalAccessAPI: any = 0;

            for (let path of paths) {
                totalAccessAPI += await new Promise(resolve => {
                    chai.request(serverUrl)
                        [path['method']](path['path'])
                        .set(userHeader)
                        .end(function(err, res) {
                            let accessable = 1;

                            if (res.status === 403) accessable = 0;

                            if (_.find(GuestAndAuthenOnlyAPI, o => o.path === path.path && o.method === path.method))
                                accessable = 0;

                            resolve(accessable);
                        });
                });
            }

            expect(totalAccessAPI).equal(0);
        });
    });

    describe('Super Admin', async function() {
        it('should be able to get roles FAQs Manager info', function(done) {
            chai.request(serverUrl)
                .get('/rbac/roles?value=name|FAQs+Manager')
                .set(adminHeader)
                .send()
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);

                    faqRoleId = JSON.parse(res.text).results[0]._id;

                    done();
                });
        });

        it('should be able to assign role FAQs Manager for user White Mouse', function(done) {
            this.timeout(5000);

            chai.request(serverUrl)
                .put(`/user/users/${user.id}`)
                .set(adminHeader)
                .send({ roles: [faqRoleId] })
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);

                    setTimeout(function() {
                        done();
                    }, 2000);
                });
        });
    });

    describe('New user White Mouse', async function() {
        it('should get error 401 when using old token to load FAQs', function(done) {
            chai.request(serverUrl)
                .get('/admin/faqs')
                .set(userHeader)
                .end(function(err, res) {
                    expect(res.status).equal(401);

                    done();
                });
        });

        it('should get new role FAQs Manager when logging again', function(done) {
            chai.request(serverUrl)
                .post('/user/auth')
                .send(user)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);

                    userLogin = { res, err, body: JSON.parse(res.text) };

                    userHeader.Authorization = userLogin.body.token;

                    expect(userLogin.body.info.roles[0].name).equal('FAQs Manager');

                    done();
                });
        });

        it('should be able to load FAQs with new token', function(done) {
            chai.request(serverUrl)
                .get('/admin/faqs')
                .set(userHeader)
                .end(function(err, res) {
                    expect(res.status).equal(200);

                    done();
                });
        });
    });

    describe('Super Admin', async function() {
        it('should be able to remove role FAQs Manager from user White Mouse', function(done) {
            this.timeout(5000);

            chai.request(serverUrl)
                .put(`/user/users/${user.id}`)
                .set(adminHeader)
                .send({ roles: [] })
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);

                    setTimeout(function() {
                        done();
                    }, 2000);
                });
        });
    });

    describe('New user White Mouse', async function() {
        it('should get error 401 when using old token to load FAQs', function(done) {
            chai.request(serverUrl)
                .get('/admin/faqs')
                .set(userHeader)
                .end(function(err, res) {
                    expect(res.status).equal(401);

                    done();
                });
        });

        it('should get no role when logging again', function(done) {
            chai.request(serverUrl)
                .post('/user/auth')
                .send(user)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);

                    userLogin = { res, err, body: JSON.parse(res.text) };

                    userHeader.Authorization = userLogin.body.token;

                    expect(userLogin.body.info.roles.length).equal(0);

                    done();
                });
        });

        it('should not be able to load FAQs with new token', function(done) {
            chai.request(serverUrl)
                .get('/admin/faqs')
                .set(userHeader)
                .end(function(err, res) {
                    expect(res.status).equal(403);

                    done();
                });
        });
    });

    describe('Super Admin', async function() {
        it('should be able delete user White Mouse', function(done) {
            chai.request(serverUrl)
                .delete(`/user/users/${user.id}`)
                .set(adminHeader)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);

                    done();
                });
        });
    });

    describe('New user White Mouse', async function() {
        it('should get error 404 when login again', function(done) {
            chai.request(serverUrl)
                .post('/user/auth')
                .send(user)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(404);

                    done();
                });
        });
    });
});

describe('Creating user with multi-roles', async function() {
    describe('Super Admin', async function() {
        it('should able to create new user White Mouse with role FAQs Manager', function(done) {
            user.roles = [faqRoleId];

            chai.request(serverUrl)
                .post('/user/users')
                .set(adminHeader)
                .send(user)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(201);

                    user.id = JSON.parse(res.text)._id;

                    done();
                });
        });
    });

    describe('New user White Mouse', async function() {
        it('should get role FAQs Manager when logging', function(done) {
            chai.request(serverUrl)
                .post('/user/auth')
                .send(user)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);

                    userLogin = { res, err, body: JSON.parse(res.text) };

                    userHeader.Authorization = userLogin.body.token;

                    expect(userLogin.body.info.roles[0].name).equal('FAQs Manager');

                    done();
                });
        });

        it('should be able to load FAQs with login token', function(done) {
            chai.request(serverUrl)
                .get('/admin/faqs')
                .set(userHeader)
                .end(function(err, res) {
                    expect(res.status).equal(200);

                    done();
                });
        });

        it('should not be be able to get package list', function(done) {
            chai.request(serverUrl)
                .get('/package/packages')
                .set(userHeader)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(403);

                    done();
                });
        });
    });

    describe('Super Admin', async function() {
        it('should be able to get permission Get all public package', function(done) {
            chai.request(serverUrl)
                .get('/rbac/permissions?term=Get+packages+by+conditions')
                .set(adminHeader)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);

                    packPermsId = JSON.parse(res.text).results[0]._id;

                    done();
                });
        });

        it('should be able to create role Custom Package Manager with permission Get all public package', function(done) {
            chai.request(serverUrl)
                .post('/rbac/roles')
                .set(adminHeader)
                .send({ name: 'Custom Package Manager', description: 'Testing role', permissions: [packPermsId] })
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(201);

                    customRoleId = JSON.parse(res.text)._id;

                    done();
                });
        });

        it('should be able to assign role Custom Package Manager for user White Mouse', function(done) {
            this.timeout(5000);

            chai.request(serverUrl)
                .put(`/user/users/${user.id}`)
                .set(adminHeader)
                .send({ roles: [faqRoleId, customRoleId] })
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);

                    setTimeout(function() {
                        done();
                    }, 2000);
                });
        });
    });

    describe('New user White Mouse', async function() {
        it('should get error 401 when using old token to get package list', function(done) {
            chai.request(serverUrl)
                .get('/package/packages')
                .set(userHeader)
                .end(function(err, res) {
                    expect(res.status).equal(401);

                    done();
                });
        });

        it('should get new role Custom Package Manager when logging again', function(done) {
            chai.request(serverUrl)
                .post('/user/auth')
                .send(user)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);

                    userLogin = { res, err, body: JSON.parse(res.text) };

                    userHeader.Authorization = userLogin.body.token;

                    expect(userLogin.body.info.roles[1].name).equal('Custom Package Manager');

                    done();
                });
        });

        it('should be able to get package list with new token', function(done) {
            chai.request(serverUrl)
                .get('/package/packages')
                .set(userHeader)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);

                    done();
                });
        });
    });

    describe('Super Admin', async function() {
        it('should be able to delete role Custom Package Manager', function(done) {
            this.timeout(5000);

            chai.request(serverUrl)
                .delete(`/rbac/roles/${customRoleId}`)
                .set(adminHeader)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);

                    setTimeout(function() {
                        done();
                    }, 2000);
                });
        });
    });

    describe('New user White Mouse', async function() {
        it('should get error 401 when using old token to get package list', function(done) {
            chai.request(serverUrl)
                .get('/package/packages')
                .set(userHeader)
                .end(function(err, res) {
                    expect(res.status).equal(401);

                    done();
                });
        });

        it('should lost role Custom Package Manager when logging again', function(done) {
            chai.request(serverUrl)
                .post('/user/auth')
                .send(user)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);

                    userLogin = { res, err, body: JSON.parse(res.text) };

                    userHeader.Authorization = userLogin.body.token;

                    expect(userLogin.body.info.roles[1]).equal(undefined);

                    done();
                });
        });

        it('should not be able to get package list with new token', function(done) {
            chai.request(serverUrl)
                .get('/package/packages')
                .set(userHeader)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(403);

                    done();
                });
        });
    });

    after(function(done) {
        chai.request(serverUrl)
            .delete(`/user/users/${user.id}`)
            .set(adminHeader)
            .end(function(err, res) {
                expect(err).to.be.null;

                expect(res).to.have.status(200);

                done();
            });
    });
});

describe('Creating user with inheritance role', async function() {
    describe('Super Admin', async function() {
        it('should able to create new user White Mouse with role FAQs Manager', function(done) {
            user.roles = [faqRoleId];

            chai.request(serverUrl)
                .post('/user/users')
                .set(adminHeader)
                .send(user)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(201);

                    user.id = JSON.parse(res.text)._id;

                    done();
                });
        });
    });

    describe('New user White Mouse', async function() {
        it('should get role FAQs Manager when logging', function(done) {
            chai.request(serverUrl)
                .post('/user/auth')
                .send(user)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);

                    userLogin = { res, err, body: JSON.parse(res.text) };

                    userHeader.Authorization = userLogin.body.token;

                    expect(userLogin.body.info.roles[0].name).equal('FAQs Manager');

                    done();
                });
        });

        it('should be able to load FAQs with login token', function(done) {
            chai.request(serverUrl)
                .get('/admin/faqs')
                .set(userHeader)
                .end(function(err, res) {
                    expect(res.status).equal(200);

                    done();
                });
        });

        it('should not be be able to get package list', function(done) {
            chai.request(serverUrl)
                .get('/package/packages')
                .set(userHeader)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(403);

                    done();
                });
        });
    });

    describe('Super Admin', async function() {
        it('should be able to get permission Get all public package', function(done) {
            chai.request(serverUrl)
                .get('/rbac/permissions?term=Get+packages+by+conditions')
                .set(adminHeader)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);

                    packPermsId = JSON.parse(res.text).results[0]._id;

                    done();
                });
        });

        it('should be able to create role Custom Package Manager with permission Get all public package', function(done) {
            chai.request(serverUrl)
                .post('/rbac/roles')
                .set(adminHeader)
                .send({ name: 'Custom Package Manager', description: 'Testing role', permissions: [packPermsId] })
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(201);

                    customRoleId = JSON.parse(res.text)._id;

                    done();
                });
        });

        it('should be able to assign role Custom Package Manager as parent of FAQs Manager', function(done) {
            this.timeout(5000);

            chai.request(serverUrl)
                .put(`/rbac/roles/${faqRoleId}`)
                .set(adminHeader)
                .send({ parent_id: customRoleId })
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);

                    setTimeout(function() {
                        done();
                    }, 2000);
                });
        });
    });

    describe('New user White Mouse', async function() {
        it('should be able to get package list', function(done) {
            chai.request(serverUrl)
                .get('/package/packages')
                .set(userHeader)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);

                    done();
                });
        });
    });

    describe('Super Admin', async function() {
        it('should be able to delete role Custom Package Manager', function(done) {
            this.timeout(5000);

            chai.request(serverUrl)
                .delete(`/rbac/roles/${customRoleId}`)
                .set(adminHeader)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);

                    setTimeout(function() {
                        done();
                    }, 2000);
                });
        });
    });

    describe('New user White Mouse', async function() {
        it('should not be able to get package list', function(done) {
            chai.request(serverUrl)
                .get('/package/packages')
                .set(userHeader)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(403);

                    done();
                });
        });
    });

    after(function(done) {
        chai.request(serverUrl)
            .delete(`/user/users/${user.id}`)
            .set(adminHeader)
            .end(function(err, res) {
                expect(err).to.be.null;

                expect(res).to.have.status(200);

                done();
            });
    });
});

describe('Enable/disable user', async function() {
    describe('Super Admin', async function() {
        it('should able to create new user White Mouse with role FAQs Manager', function(done) {
            user.roles = [faqRoleId];

            chai.request(serverUrl)
                .post('/user/users')
                .set(adminHeader)
                .send(user)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(201);

                    user.id = JSON.parse(res.text)._id;

                    done();
                });
        });
    });

    describe('New user White Mouse', async function() {
        it('should get role FAQs Manager when logging', function(done) {
            chai.request(serverUrl)
                .post('/user/auth')
                .send(user)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);

                    userLogin = { res, err, body: JSON.parse(res.text) };

                    userHeader.Authorization = userLogin.body.token;

                    expect(userLogin.body.info.roles[0].name).equal('FAQs Manager');

                    done();
                });
        });

        it('should be able to load FAQs with login token', function(done) {
            chai.request(serverUrl)
                .get('/admin/faqs')
                .set(userHeader)
                .end(function(err, res) {
                    expect(res.status).equal(200);

                    done();
                });
        });
    });

    describe('Super Admin', async function() {
        it('should be able to disable user White Mouse', function(done) {
            chai.request(serverUrl)
                .put(`/user/users/${user.id}`)
                .set(adminHeader)
                .send({ is_disabled: true })
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);

                    done();
                });
        });
    });

    describe('New user White Mouse', async function() {
        it('should get error 403 when using old token to load FAQs', function(done) {
            chai.request(serverUrl)
                .get('/admin/faqs')
                .set(userHeader)
                .end(function(err, res) {
                    expect(res.status).equal(403);

                    done();
                });
        });
        it('should get error 403 when logging', function(done) {
            chai.request(serverUrl)
                .post('/user/auth')
                .send(user)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(403);

                    done();
                });
        });
    });

    describe('Super Admin', async function() {
        it('should be able to enable user White Mouse', function(done) {
            chai.request(serverUrl)
                .put(`/user/users/${user.id}`)
                .set(adminHeader)
                .send({ is_disabled: false })
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);

                    done();
                });
        });
    });

    describe('New user White Mouse', async function() {
        it('should load FAQs normally using old token', function(done) {
            chai.request(serverUrl)
                .get('/admin/faqs')
                .set(userHeader)
                .end(function(err, res) {
                    expect(res.status).equal(200);

                    done();
                });
        });
        it('should login normally', function(done) {
            chai.request(serverUrl)
                .post('/user/auth')
                .send(user)
                .end(function(err, res) {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);

                    done();
                });
        });
    });

    after(function(done) {
        chai.request(serverUrl)
            .delete(`/user/users/${user.id}`)
            .set(adminHeader)
            .end(function(err, res) {
                expect(err).to.be.null;

                expect(res).to.have.status(200);

                done();
            });
    });
});
