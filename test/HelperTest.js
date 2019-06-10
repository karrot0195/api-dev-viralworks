const Constant = require('./Constants');
const Api = require('./Api')();
Api.setPathApi(Constant.pathApi);

module.exports = function(done) {
    return {
        takeAdminToken: () => {
            Api.adminToken().then(res => {
                if (res.error) {
                    done(res.body);
                } else {
                    Api.setToken(res.body.token);
                    this.tokenAdmin = res.body.token;
                    done();
                }
            });
        },
        createJob: () => {
            const data = {
                number: 1,
                is_send: false
            };
            Api.put(`job/jobs/generate`, data).then(res => {
                if (res.jobs && res.jobs.length) {
                    this.jobId = res.jobs[0];
                    console.log(`\t job id: ${this.jobId}`);
                    done();
                } else {
                    done(res);
                }
            });
        },
        addGroup: () => {
            const data = {
                tag: 2,
                price: 300000
            };
            Api.post(`job/jobs/${this.jobId}/groups`, data).then(res => {
                if (res._id) {
                    done();
                } else {
                    done(res);
                }
            });
        },
        addGroupExists: () => {
            const data = {
                tag: 2,
                price: 300000
            };
            Api.post(`job/jobs/${this.jobId}/groups`, data).then(res => {
                if (res.code == 404) {
                    done();
                } else {
                    done(res);
                }
            });
        },
        deleteJob: () => {
            if (!this.jobId) done('NOT_EXISTS_JOB_ID');
            Api.delete(`job/jobs/${this.jobId}`, {}).then(res => {
                if (res.success) {
                    done();
                } else {
                    done(res);
                }
            });
        },
        addKol: () => {
            Api.get('kol/auth/kol-users', { value: 'email|' + Constant.kolEmail }).then(res => {
                if (!this.jobId) {
                    done('NOT_EXISTS_JOB_ID');
                }

                if (res.results && res.results.length > 0) {
                    const kol = res.results[0];
                    Api.post(`job/jobs/${this.jobId}/kols`, {
                        groups: [
                            {
                                tag: 1,
                                kols: [kol._id]
                            }
                        ]
                    }).then(res => {
                        if (!res.error) {
                            this.kolId = kol._id;
                            done();
                        } else {
                            done(res);
                        }
                    });
                } else {
                    done('KOL_TEST_NOT_FOUND');
                }
            });
        },
        removeKol: () => {
            if (!this.kolId) done('KOL_GROUP_NOT_EXISTS');
            Api.delete(`job/jobs/${this.jobId}/kols`, {
                groups: [
                    {
                        tag: 1,
                        kols: [this.kolId]
                    }
                ]
            }).then(res => {
                if (!res.error) {
                    done();
                } else {
                    done(res);
                }
            });
        },
        inviteKols: () => {
            if (!this.jobId) this.jobId = '5cf8d5314e833b0e84da52a7';
            Api.put(`job/jobs/${this.jobId}/invites`).then(res => {
                if (!res.error) {
                    done();
                } else {
                    done(res);
                }
            });
        },
        takeKolToken: () => {
            Api.kolToken({ email: Constant.kolEmail, password: Constant.kolPassword }).then(res => {
                if (res.error) {
                    done(res.body);
                } else {
                    this.tokenKol = res.body.token;
                    Api.setToken(res.body.token);
                    done();
                }
            });
        },
        kolJoinInvite: () => {
            Api.get(`kol/kol/invites`).then(res => {
                if (res.error) done(res);
                else {
                    if (res.length) {
                        this.invite = res[res.length - 1];
                    }

                    let question = [];
                    this.invite.job_id.questions.forEach(q => {
                        question.push({
                            id: q._id,
                            answer: q.choose
                        });
                    });

                    if (this.invite){
                        Api.put(`kol/kol/invites/${this.invite._id}/join`, {
                            "time": this.invite.job_id.time[0]._id,
                            "questions": question
                        }).then(res => {
                           if (res.error) {
                               this.kolJob = res;
                               done(res);
                           } else {
                               done();
                           }
                        });
                    } else {
                        done('INVITE_EMPTY');
                    }
                }
            });
        },
        kolUpdatePostContent: () => {
            if (!this.kolJob) {
                done('KOL_JOB_NOT_FOUND');
            } else {
                if (this.kolJob.type == 4) {
                    done()
                } else {

                }
            }
        },
    };
};
