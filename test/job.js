const HelperTest = require('./HelperTest');

describe('Test Job', function() {
    // it('Get token admin', function(done) {
    //     HelperTest(done).takeAdminToken();
    // });
    //
    // it('Create job', function(done) {
    //     HelperTest(done).createJob();
    // });
    //
    //
    // it('Add group', function(done) {
    //     HelperTest(done).addGroup();
    // });
    //
    // it('Check not add group exists', function(done) {
    //     HelperTest(done).addGroupExists();
    // });
    //
    // it('Check add kol', function(done) {
    //     HelperTest(done).addKol();
    // });
    //
    // it('Check remove kol', function(done) {
    //     HelperTest(done).removeKol();
    // });
    //
    // it('Check add kol again', function(done) {
    //     HelperTest(done).addKol();
    // });
    //
    // it('invite kols', function(done) {
    //     HelperTest(done).inviteKols();
    // });

    it('Kol login', function(done) {
        HelperTest(done).takeKolToken();
    });

    // it('Kol join invite', function(done) {
    //     HelperTest(done).kolJoinInvite();
    // });

    it('kol update post content', function(done) {
        HelperTest(done).kolUpdatePostContent();
    });

    // it('Delete job', function(done) {
    //     HelperTest(done).deleteJob();
    // });
});