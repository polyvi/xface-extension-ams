
/*
 Copyright 2012-2013, Polyvi Inc. (http://polyvi.github.io/openxface)
 This program is distributed under the terms of the GNU General Public License.

 This file is part of xFace.

 xFace is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 xFace is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with xFace.  If not, see <http://www.gnu.org/licenses/>.
 */

#import "XAmsExt.h"
#import "XAms.h"
#import <XFace/XAppInstallListener.h>
#import <XFace/XApplication.h>
#import <XFace/XAppInfo.h>
#import <XFace/XAppList.h>
#import <XFace/XConfiguration.h>
#import <XFace/XUtils.h>
#import <XFace/XConstants.h>
#import <XFace/XAppView.h>
#import "XAmsImpl.h"
#import <XFace/XAppManagement.h>
#import <XFace/XRuntime.h>
#import <XFace/XViewController.h>

#import <Cordova/CDVInvokedUrlCommand.h>
#import <Cordova/CDVPluginResult.h>
#import <Cordova/NSArray+Comparisons.h>

#define AMS_EXTENSION_NAME                  @"AMS"

// 定义构造ExtResult使用的key常量
#define EXTENSION_RESULT_APP_ID             @"appid"
#define EXTENSION_RESULT_APP_NAME           @"name"
#define EXTENSION_RESULT_APP_ICON           @"icon"
#define EXTENSION_RESULT_APP_ICON_BGCOLOR   @"icon_background_color"
#define EXTENSION_RESULT_APP_VERSION        @"version"
#define EXTENSION_RESULT_APP_TYPE           @"type"
#define EXTENSION_RESULT_APP_WIDTH          @"width"
#define EXTENSION_RESULT_APP_HEIGHT         @"height"

@implementation XAmsExt

- (id)initWithWebView:(UIWebView*)theWebView
{
    self = (id)[super initWithWebView:theWebView];
    if (self) {
        id<UIApplicationDelegate> appDelegate = [UIApplication sharedApplication].delegate;
        XRuntime *runtime = [appDelegate performSelector:@selector(runtime)];
        XAppManagement *appManagement = [runtime performSelector:@selector(appManagement)];
        XViewController *viewController = [runtime performSelector:@selector(viewController)];

        //只有default app才能注册ams扩展
        if (theWebView != viewController.webView) {
            self = nil;
        } else {
            self->ams = [[XAmsImpl alloc] init:appManagement];
        }
    }
    return self;
}

- (void) installApplication:(CDVInvokedUrlCommand*)command
{
    NSString *pkgPath= [command.arguments objectAtIndex:0];

    // 实现应用的异步安装功能
    NSArray *installArgs = [self buildArgsWithOperationType:INSTALL packagePath:pkgPath appId:nil callbackId:command.callbackId];
    [XUtils performSelectorInBackgroundWithTarget:self->ams selector:@selector(installApp:) withObject:installArgs];
}

- (void) updateApplication:(CDVInvokedUrlCommand*)command
{
    NSString *pkgPath= [command.arguments objectAtIndex:0];

    // 实现应用的异步更新功能
    NSArray *updateArgs = [self buildArgsWithOperationType:UPDATE packagePath:pkgPath appId:nil callbackId:command.callbackId];
    [XUtils performSelectorInBackgroundWithTarget:self->ams selector:@selector(updateApp:) withObject:updateArgs];
}

- (void) uninstallApplication:(CDVInvokedUrlCommand*)command
{
    NSString *appId = [command.arguments objectAtIndex:0];

    // 实现应用的异步卸载功能
    NSArray *uninstallArgs = [self buildArgsWithOperationType:UNINSTALL packagePath:nil appId:appId callbackId:command.callbackId];
    [XUtils performSelectorInBackgroundWithTarget:self->ams selector:@selector(uninstallApp:) withObject:uninstallArgs];
    return;
}

- (void) startApplication:(CDVInvokedUrlCommand*)command
{
    NSString *appId = [command.arguments objectAtIndex:0];
    NSString *params = [command.arguments objectAtIndex:1 withDefault:nil];

    BOOL successful = [self->ams startApp:appId withParameters:params];
    CDVCommandStatus status = successful ? CDVCommandStatus_OK : CDVCommandStatus_ERROR;
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:status messageAsString:appId];

    // 将扩展结果返回给js端
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) listInstalledApplications:(CDVInvokedUrlCommand*)command
{
    // 组装扩展结果，结果中不包括默认应用
    XAppList *appList = [self->ams getAppList];
    @synchronized(appList)
    {
        NSEnumerator *enumerator = [appList getEnumerator];
        id<XApplication> app = nil;

        NSMutableArray *message = [NSMutableArray arrayWithCapacity:1];
        while ((app = [enumerator nextObject]))
        {
            if (![app.getAppId isEqualToString:appList.defaultAppId])
            {
                [message addObject:[self translateAppInfoToDictionary:app]];
            }
        }
        CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:message];

        // 将扩展结果返回给js端
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }
}

- (void) listPresetAppPackages:(CDVInvokedUrlCommand*)command
{
    NSMutableArray *packageNames = [self->ams getPresetAppPackages];
    if(!packageNames)
    {
        packageNames = [[NSMutableArray alloc] init];
    }

    // 将包名转换为相对路径（相对于app workspace）
    const int count = [packageNames count];
    for(int i = 0; i < count; i++)
    {
        NSString *packageName = [packageNames objectAtIndex:i];
        NSString *relativePath = [PRE_SET_DIR_NAME stringByAppendingPathComponent:packageName];
        [packageNames replaceObjectAtIndex:i withObject:relativePath];
    }

    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsArray:packageNames];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void) getStartAppInfo:(CDVInvokedUrlCommand*)command
{
    id<XApplication> defaultApp = [[ams getAppList] getDefaultApp];
    NSDictionary *infoDict = [self translateAppInfoToDictionary:defaultApp];

    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:infoDict];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

+ (NSString*) getExtName
{
    return AMS_EXTENSION_NAME;
}

#pragma mark private methods

- (NSArray *) buildArgsWithOperationType:(OPERATION_TYPE)type packagePath:(NSString *)pkgPath appId:(NSString *)appId callbackId:(NSString *)callbackId
{
    id<XApplication> app = [self ownerApp];

    id<XInstallListener> listener = [[XAppInstallListener alloc] initWithJsEvaluator:self.commandDelegate callbackId:callbackId];

    NSArray *args = nil;
    switch (type) {
        case INSTALL:
        case UPDATE:
            args = [NSArray arrayWithObjects:app, pkgPath, listener, nil];
            break;
        case UNINSTALL:
            args = [NSArray arrayWithObjects:appId, listener, nil];
            break;
        default:
            NSAssert(NO, nil);
            break;
    }
    return args;
}

- (NSDictionary *) translateAppInfoToDictionary:(id<XApplication>)app
{
    XAppInfo* info = app.appInfo;
    NSMutableDictionary *item = [NSMutableDictionary dictionaryWithCapacity:7];
    [item setObject:CAST_TO_NSNULL_IF_NIL([info appId]) forKey:EXTENSION_RESULT_APP_ID];
    [item setObject:CAST_TO_NSNULL_IF_NIL([info name]) forKey:EXTENSION_RESULT_APP_NAME];
    [item setObject:CAST_TO_NSNULL_IF_NIL([info version]) forKey:EXTENSION_RESULT_APP_VERSION];
    [item setObject:CAST_TO_NSNULL_IF_NIL([info type]) forKey:EXTENSION_RESULT_APP_TYPE];
    [item setObject:[NSNumber numberWithInt:[info width]] forKey:EXTENSION_RESULT_APP_WIDTH];
    [item setObject:[NSNumber numberWithInt:[info height]] forKey:EXTENSION_RESULT_APP_HEIGHT];

    [item setObject:CAST_TO_NSNULL_IF_NIL([app getIconURL]) forKey:EXTENSION_RESULT_APP_ICON];
    [item setObject:CAST_TO_NSNULL_IF_NIL(info.iconBgColor) forKey:EXTENSION_RESULT_APP_ICON_BGCOLOR];
    return item;
}

@end
