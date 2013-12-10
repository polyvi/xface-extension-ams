describe('AMS (xFace.AMS)', function () {
    it("ams.spec.1 should exist", function () {
        expect(xFace.AMS).toBeDefined();
    });

    it("ams.spec.2 should define constants for AmsError", function() {
        // ams error codes
        expect(AmsError).toBeDefined();
        expect(AmsError.NO_SRC_PACKAGE).toBe(1);
        expect(AmsError.APP_ALREADY_EXISTED).toBe(2);
        expect(AmsError.IO_ERROR).toBe(3);
        expect(AmsError.NO_TARGET_APP).toBe(4);
        expect(AmsError.NO_APP_CONFIG_FILE).toBe(5);
        expect(AmsError.APP_NOT_FOUND).toBe(7);
        expect(AmsError.APP_ALREADY_RUNNING).toBe(8);
        expect(AmsError.APP_ENTRY_ERR).toBe(9);
        expect(AmsError.START_NATIVE_APP_ERR).toBe(10);
        expect(AmsError.UNKNOWN).toBe(11);
    });

    it("ams.spec.3 should define constants for AmsState", function() {
        // ams install progress
        expect(AmsState).toBeDefined();
        expect(AmsState.INSTALL_INITIALIZE).toBe(0);
        expect(AmsState.INSTALL_INSTALLING).toBe(1);
        expect(AmsState.INSTALL_WRITE_CONFIGURATION).toBe(2);
        expect(AmsState.INSTALL_FINISHED).toBe(3);
    });

    it("ams.spec.4 should define constants for AmsOperationType", function() {
        // ams operation type
        expect(AmsOperationType).toBeDefined();
        expect(AmsOperationType.INSTALL).toBe(1);
        expect(AmsOperationType.UPDATE).toBe(2);
        expect(AmsOperationType.UNINSTALL).toBe(3);
    });
    describe("installApplication", function() {
        it("ams.spec.5 installApplication should be defined", function() {
            expect(typeof xFace.AMS.installApplication).toBeDefined();
            expect(typeof xFace.AMS.installApplication == 'function').toBe(true);
        });
        //测试安装app,app应用包不存在,错误码为1 应用安装包不存在
        it("ams.spec.6 test install app with no app package!!error callback should be called with an json string", function() {
            var win = jasmine.createSpy(),
            fail = jasmine.createSpy().andCallFake(function(info) {
                expect(typeof info == 'string'|| typeof info == 'object').toBe(true);
                expect(info.errorcode == AmsError.NO_SRC_PACKAGE).toBe(true);
                expect(info.type == AmsOperationType.INSTALL).toBe(true);
            }),
            status = jasmine.createSpy();

            runs(function () {
                xFace.AMS.installApplication("testappnotexist.zip", win, fail, status);
            });

            waitsFor(function () { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

            runs(function () {
                expect(win).not.toHaveBeenCalled();
                expect(status).not.toHaveBeenCalled();
            });
        });

		//测试安装app, 参数空字符串, 失败回调会被调用
        it("ams.spec.7 test install app with empty packagePath!! TypeError should be thrown", function() {
            var win = jasmine.createSpy(),
            fail = jasmine.createSpy(),
            status = jasmine.createSpy();
            xFace.AMS.installApplication("", win, fail, status);
            waitsFor(function() {
                return fail.wasCalled;
            }, "fail never called", Tests.TEST_TIMEOUT);
            runs(function () {
                expect(win).not.toHaveBeenCalled();
                expect(status).not.toHaveBeenCalled();
            });
        });

        //测试安装app, 参数为数字, 由于添加了参数检测，函数会抛出类型异常，成功和失败回调都不会被调用
        it("ams.spec.8 test install app with invalid argument!! TypeError should be thrown", function() {
            var win = jasmine.createSpy(),
            fail = jasmine.createSpy(),
            status = jasmine.createSpy();

            runs(function() {
                try {
                    xFace.AMS.installApplication(1, win, fail, status);
                }
                catch (e) {
                    expect(e.name == "TypeError").toBe(true);
                }
            });

            runs(function () {
                expect(fail).not.toHaveBeenCalled();
                expect(win).not.toHaveBeenCalled();
                expect(status).not.toHaveBeenCalled();
            });
        });

        //测试安装app, 无参数，由于添加了参数检测，函数会抛出类型异常，成功和失败回调都不会被调用
        it("ams.spec.9 test install app with no argument!! TypeError should be thrown", function() {
            runs(function() {
                try {
                    xFace.AMS.installApplication();
                }
                catch (e) {
                    expect(e.name == "TypeError").toBe(true);
                }
            });
        });

        //测试初次安装app,app应用包存在(在workspace的appPackage/test.zip)应该正确安装并调用成功的回调函数和进度回调函数
        it("ams.spec.10 test install app first time with app package exist!success callback and statusChanged callback should be called with an json string", function(){
            var win = jasmine.createSpy().andCallFake(function(info) {
                expect(typeof info == 'string'|| typeof info == 'object').toBe(true);
                expect(info.appid == 'test').toBe(true);
                if(!isAndroid()) {
                    expect(info.type == AmsOperationType.INSTALL).toBe(true);
                }
            }),
            fail = jasmine.createSpy(),
            status = jasmine.createSpy().andCallFake(function(info) {
                expect(typeof info == 'string'|| typeof info == 'object').toBe(true);
                expect(info.progress == progressValue).toBe(true);
                progressValue++;
            });

            runs(function () {
                xFace.AMS.installApplication("appPackage/test.zip", win, fail, status);
            });

            waitsFor(function () { return status.wasCalled; }, "status never called", Tests.TEST_TIMEOUT);
            waitsFor(function () { return win.wasCalled; }, "win never called", Tests.TEST_TIMEOUT);

            runs(function () {
                expect(fail).not.toHaveBeenCalled();
            });
        });
        //测试再次安装app,app已经安装,app应用包存在(在workspace的appPackage/sametestapp.zip) 应该安装失败并调用失败的回调函数 错误码为2 应用已经被安装
        it("ams.spec.11 test install app again(app already exist) with app package exist!error callback should be called with an json string", function() {
            var win = jasmine.createSpy(),
            fail = jasmine.createSpy().andCallFake(function(info) {
                expect(typeof info == 'string'|| typeof info == 'object').toBe(true);
                expect(info.errorcode == AmsError.APP_ALREADY_EXISTED).toBe(true);
                expect(info.type == AmsOperationType.INSTALL).toBe(true);
                expect(info.appid == 'test').toBe(true);
            }),
            status = jasmine.createSpy();

            runs(function () {
                xFace.AMS.installApplication("appPackage/sametestapp.zip", win, fail, status);
            });

            waitsFor(function () { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

            runs(function () {
                expect(win).not.toHaveBeenCalled();
            });
        });

        //测试安装app,app包错误没有相应的配置文件,app应用包存在(在workspace的appPackage/errorappnoappxml.zip) 应该安装失败并调用失败的回调函数 错误码为5 安装包中不存在应用配置文件
        it("ams.spec.12 test install app with error app package(no app.xml)!!error callback should be called with an json string", function() {
            var win = jasmine.createSpy(),
            fail = jasmine.createSpy().andCallFake(function(info) {
                expect(typeof info == 'string'|| typeof info == 'object').toBe(true);
                expect(info.errorcode == AmsError.NO_APP_CONFIG_FILE).toBe(true);
                if(!isAndroid()) {
                    expect(info.type == AmsOperationType.INSTALL).toBe(true);
                }
            }),
            status = jasmine.createSpy();

            runs(function () {
                xFace.AMS.installApplication("appPackage/errorappnoappxml.zip", win, fail, status);
            });

            waitsFor(function () { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

            runs(function () {
                expect(win).not.toHaveBeenCalled();
            });
        });

        //测试安装app,app包错误不能被解压,app应用包存在(在workspace的appPackage/cantunpackapp.zip) 应该安装失败并调用失败的回调函数 错误码为5 配置文件不存在
        it("ams.spec.13 test install app with error unpack app package(can't unpack apppackage)!!error callback should be called with an json string", function() {
            var win = jasmine.createSpy(),
            fail = jasmine.createSpy().andCallFake(function(info) {
                expect(typeof info == 'string'|| typeof info == 'object').toBe(true);
                expect(info.errorcode == AmsError.NO_APP_CONFIG_FILE).toBe(true);
                if(!isAndroid()) {
                    expect(info.type == AmsOperationType.INSTALL).toBe(true);
                }
            }),
            status = jasmine.createSpy();

            runs(function () {
                xFace.AMS.installApplication("appPackage/cantunpackapp.zip", win, fail, status);
            });

            waitsFor(function () { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

            runs(function () {
                expect(win).not.toHaveBeenCalled();
            });
        });
    });

    describe("updateApplication", function() {
        it("ams.spec.14 updateApplication should be defined", function() {
            expect(xFace.AMS.updateApplication).toBeDefined();
            expect(typeof xFace.AMS.updateApplication == 'function').toBe(true);
        });

        //测试升级app,应用安装包不存在的情况,错误码为1 应用安装包不存在
        it("ams.spec.15 test update app with no app package!!error callback should be called with an json string", function() {
            var win = jasmine.createSpy(),
            fail = jasmine.createSpy().andCallFake(function(info) {
                expect(typeof info == 'string'|| typeof info == 'object').toBe(true);
                expect(info.errorcode == AmsError.NO_SRC_PACKAGE).toBe(true);
                if(!isAndroid()) {
                    expect(info.type == AmsOperationType.UPDATE).toBe(true);
                }
            }),
            status = jasmine.createSpy();

            runs(function () {
                xFace.AMS.updateApplication("appPackage/test.zip", win, fail, status);
            });

            waitsFor(function () { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

            runs(function () {
                expect(win).not.toHaveBeenCalled();
                expect(status).not.toHaveBeenCalled();
            });
        });

        //测试升级app, 参数为空串, 失败回调会被调用
        it("ams.spec.16 test update app with empty packagePath! error callback should be called", function() {
            var win = jasmine.createSpy(),
            fail = jasmine.createSpy(),
            status = jasmine.createSpy();
            xFace.AMS.updateApplication("", win, fail, status);
            waitsFor(function() {
                return fail.wasCalled;
            }, "fail never called", Tests.TEST_TIMEOUT);
            runs(function () {
                expect(win).not.toHaveBeenCalled();
                expect(status).not.toHaveBeenCalled();
            });
        });

        //测试升级app, 参数为数字,由于添加了参数检测，函数会抛出类型异常，成功和失败回调都不会被调用
        it("ams.spec.17 test update app with invalid argument!! TypeError should be thrown", function() {
            var win = jasmine.createSpy(),
            fail = jasmine.createSpy(),
            status = jasmine.createSpy();

            runs(function() {
                try {
                    xFace.AMS.updateApplication(1, win, fail, status);
                }
                catch (e) {
                    expect(e.name == "TypeError").toBe(true);
                }
            });

            runs(function () {
                expect(fail).not.toHaveBeenCalled();
                expect(win).not.toHaveBeenCalled();
                expect(status).not.toHaveBeenCalled();
            });
        });

         //测试升级app, 无参数， 由于添加了参数检测，函数会抛出类型异常
        it("ams.spec.18 test update app with no argument!! TypeError should be thrown", function() {
            runs(function() {
                try {
                    xFace.AMS.updateApplication();
                }
                catch (e) {
                    expect(e.name == "TypeError").toBe(true);
                }
            });
        });

        //测试升级app,低版本的app已经安装,高版本的应用安装包存在(在workspace的appPackage/testUpdateHighVersion.zip)应该正确安装升级并调用成功的回调函数和进度回调函数
        it("ams.spec.19 test update app with higher version app!!success callback and statusChanged callback should be called with an json string", function() {
            var progressValue = 0;
            var win = jasmine.createSpy().andCallFake(function(info) {
                expect(typeof info == 'string'|| typeof info == 'object').toBe(true);
                expect(info.appid == 'test').toBe(true);
                if(!isAndroid()) {
                    expect(info.type == AmsOperationType.UPDATE).toBe(true);
                }
            }),
            fail = jasmine.createSpy(),
            status = jasmine.createSpy().andCallFake(function(info) {
                expect(typeof info == 'string'|| typeof info == 'object').toBe(true);
                expect(info.progress == progressValue).toBe(true);
                progressValue++;
            });

            runs(function () {
                xFace.AMS.updateApplication("appPackage/testUpdateHighVersion.zip", win, fail, status);
            });

            waitsFor(function () { return status.wasCalled; }, "status never called", Tests.TEST_TIMEOUT);
            waitsFor(function () { return win.wasCalled; }, "win never called", Tests.TEST_TIMEOUT);

            runs(function () {
                expect(fail).not.toHaveBeenCalled();
            });
        });

        //测试升级app,app未安装,高版本的应用安装包存在(在workspace的appPackage/testUpdatenoapp.zip)应该升级失败并调用失败回调函数错误码为4 未找到待操作的目标应用
        it("ams.spec.20 test update app with app not installed!!error callback should be called with an json string", function() {
            var win = jasmine.createSpy(),
            fail = jasmine.createSpy().andCallFake(function(info) {
                expect(typeof info == 'string'|| typeof info == 'object').toBe(true);
                expect(info.errorcode == AmsError.NO_TARGET_APP).toBe(true);
                if(!isAndroid()) {
                    expect(info.type == AmsOperationType.UPDATE).toBe(true);
                }
            }),
            status = jasmine.createSpy();

            runs(function () {
                xFace.AMS.updateApplication("appPackage/testUpdatenoapp.zip", win, fail, status);
            });

            waitsFor(function () { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

            runs(function () {
                 expect(win).not.toHaveBeenCalled();
            });
        });
    });

    describe("startApplication", function() {
        it("ams.spec.21 startApplication should be defined", function() {
            expect(xFace.AMS.startApplication).toBeDefined();
            expect(typeof xFace.AMS.startApplication == 'function').toBe(true);
        });

        //测试启动app,目标app不存在，错误回调返回相应的appid
        it("ams.spec.22 test start app with not exist app!! error callback should be called with an json string", function() {
            var win = jasmine.createSpy(),
            fail = jasmine.createSpy().andCallFake(function(error) {
                expect(typeof info == 'string'|| typeof error == 'object').toBe(true);
                expect(error.appid == 'teststartnotexistapp').toBe(true);
                expect(error.errorcode == AmsError.APP_NOT_FOUND).toBe(true);
            });

            runs(function () {
                xFace.AMS.startApplication("teststartnotexistapp", win, fail);
            });

            waitsFor(function () { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

            runs(function () {
                expect(win).not.toHaveBeenCalled();
            });
        });

        //测试启动app, 参数为空串，失败回调被调用
        it("ams.spec.23 test start app with empty packagePath! error callback should be called", function() {
            var win = jasmine.createSpy(),
            fail = jasmine.createSpy();
            xFace.AMS.startApplication("", win, fail);
            waitsFor(function() {
                return fail.wasCalled;
            }, "fail never called", Tests.TEST_TIMEOUT);
            runs(function () {
                expect(win).not.toHaveBeenCalled();
            });
        });

         //测试启动app, 参数为数字，由于添加了参数检测，函数会抛出类型异常，成功和失败回调都不会被调用
        it("ams.spec.24 test start app with invalid argument!! TypeError should be thrown", function() {
            var win = jasmine.createSpy(),
            fail = jasmine.createSpy();

            runs(function() {
                try {
                    xFace.AMS.startApplication(1, win, fail);
                }
                catch (e) {
                    expect(e.name == "TypeError").toBe(true);
                }
            });

            runs(function () {
                expect(fail).not.toHaveBeenCalled();
                expect(win).not.toHaveBeenCalled();
            });
        });

        //测试启动app, 无参数，由于添加了参数检测，函数会抛出类型异常
        it("ams.spec.25 test start app with no argument!! TypeError should be thrown", function() {
            runs(function() {
                try {
                    xFace.AMS.startApplication();
                }
                catch (e) {
                    expect(e.name == "TypeError").toBe(true);
                }
            });
        });

    });

    describe("listInstalledApplications", function() {
        it("ams.spec.26 listInstalledApplications should be defined", function() {
            expect(xFace.AMS.listInstalledApplications).toBeDefined();
            expect(typeof xFace.AMS.listInstalledApplications == 'function').toBe(true);
        });

        //列出前面安装app,成功回调返回已安装的应用appinfo的数组
        it("ams.spec.27 test listInstalledApplications!! success callback should be called with an json string", function() {
           var win = jasmine.createSpy().andCallFake(function(info) {
                expect(typeof info == 'string'|| typeof info == 'object').toBe(true);
                expect(info.length).toBeGreaterThan(0);
            }),
            fail = jasmine.createSpy();

            runs(function () {
                xFace.AMS.listInstalledApplications(win, fail);
            });

            waitsFor(function () { return win.wasCalled; }, "win never called", Tests.TEST_TIMEOUT);

            runs(function () {
                expect(fail).not.toHaveBeenCalled();
            });
        });
    });

    describe("listPresetAppPackages", function() {
        it("ams.spec.28 listPresetAppPackages should be defined", function() {
            expect(xFace.AMS.listPresetAppPackages).toBeDefined();
            expect(typeof xFace.AMS.listPresetAppPackages == 'function').toBe(true);
        });

        //列出预安装app包,成功回调返回预安装app包的数组
        it("ams.spec.29 test listPresetAppPackages!! success callback should be called with an json string", function() {
            var win = jasmine.createSpy().andCallFake(function(info) {
                expect(typeof info == 'string'|| typeof info == 'object').toBe(true);
                expect(info.length == 2).toBe(true);
            }),
            fail = jasmine.createSpy();

            runs(function () {
                xFace.AMS.listPresetAppPackages(win, fail);
            });

            waitsFor(function () { return win.wasCalled; }, "win never called", Tests.TEST_TIMEOUT);

            runs(function () {
                expect(fail).not.toHaveBeenCalled();
            });
        });
    });

    describe("getStartAppInfo", function() {
        it("ams.spec.30 getStartAppInfo should be defined", function() {
            expect(xFace.AMS.getStartAppInfo).toBeDefined();
            expect(typeof xFace.AMS.getStartAppInfo == 'function').toBe(true);
        });

        //测试获取appinfo,default app，成功回调返回相应的appid
        it("ams.spec.31 test get appinfo!!success callback should be called with an appinfo object", function() {
            var fail = jasmine.createSpy(),
            win = jasmine.createSpy().andCallFake(function(info) {
                expect(typeof info == 'string'|| typeof info == 'object').toBe(true);
                expect(info.appid.length > 0).toBe(true);
            });

            runs(function () {
                xFace.AMS.getStartAppInfo(win, fail);
            });

            waitsFor(function () { return win.wasCalled; }, "win never called", Tests.TEST_TIMEOUT);

            runs(function () {
                expect(fail).not.toHaveBeenCalled();
            });
        });
    });

    describe("uninstallApplication", function() {
        it("ams.spec.32 uninstallApplication should be defined", function() {
            expect(xFace.AMS.uninstallApplication).toBeDefined();
            expect(typeof xFace.AMS.uninstallApplication == 'function').toBe(true);
        });

        //测试卸载app,目标app不存在，错误码为4 待卸载的目标app不存在
        it("ams.spec.33 test uninstall app with app not exist!! Error callback should be called with an json string", function() {
            var win = jasmine.createSpy(),
            fail = jasmine.createSpy().andCallFake(function(info) {
                expect(typeof info == 'string'|| typeof info == 'object').toBe(true);
                expect(info.errorcode == AmsError.NO_TARGET_APP).toBe(true);
                if(!isAndroid()) {
                    expect(info.type == AmsOperationType.UNINSTALL).toBe(true);
                }
            });

            runs(function () {
                xFace.AMS.uninstallApplication("noexistapp", win, fail);
            });

            waitsFor(function () { return fail.wasCalled; }, "fail never called", Tests.TEST_TIMEOUT);

            runs(function () {
                expect(win).not.toHaveBeenCalled();
            });
        });

        //测试卸载app, 参数为空串，失败回调会被调用
        it("ams.spec.34 test uninstall app with invalid argument!error callback should be called", function() {
            var win = jasmine.createSpy(),
            fail = jasmine.createSpy();
            runs(function () {
                xFace.AMS.uninstallApplication("", win, fail);
            });
            waitsFor(function() {
                return fail.wasCalled;
            }, "fail never called", Tests.TEST_TIMEOUT);
            runs(function () {
                expect(win).not.toHaveBeenCalled();
            });
        });

        //测试卸载app, 无参数， 由于添加了参数检测，函数会抛出类型异常
        it("ams.spec.35 test uninstall app with no argument!! TypeError should be thrown", function() {
            runs(function() {
                try {
                    xFace.AMS.uninstallApplication();
                }
                catch (e) {
                    expect(e.name == "TypeError").toBe(true);
                }
            });
        });

        //测试卸载app,卸载前面安装的test app.应该正确卸载
        it("ams.spec.36 test uninstall app!! Success callback should be called with an json string", function() {
            var win = jasmine.createSpy().andCallFake(function(info) {
                expect(typeof info == 'string'|| typeof info == 'object').toBe(true);
                expect(info.appid == 'test').toBe(true);
                if(!isAndroid()) {
                    expect(info.type == AmsOperationType.UNINSTALL).toBe(true);
                }
            }),
            fail = jasmine.createSpy();

            runs(function () {
                xFace.AMS.uninstallApplication("test", win, fail);
            });

            waitsFor(function () { return win.wasCalled; }, "win never called", Tests.TEST_TIMEOUT);

            runs(function () {
                expect(fail).not.toHaveBeenCalled();
            });
        });
    });
});
