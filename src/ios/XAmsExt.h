
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

#import <Foundation/Foundation.h>
#import <XFace/CDVPlugin+XPlugin.h>

@protocol XAms;

/**
    AMS扩展，用于提供通过脚本对应用进行管理的功能
 */
@interface XAmsExt : CDVPlugin
{
    NSObject<XAms>           *ams;           /**< 应用管理的真正实现者 */
}

/**
    安装一个应用
    @param command.arguments
      - 0 NSString* packpagePath 相对于当前应用工作空间的应用安装包路径
 */
- (void) installApplication:(CDVInvokedUrlCommand*)command;

/**
    更新一个应用
    @param command.arguments
      - 0 NSString* packpagePath 相对于当前应用工作空间的应用更新包路径
 */
- (void) updateApplication:(CDVInvokedUrlCommand*)command;

/**
    卸载一个应用
    @param command.arguments
       - 0 NSString* appId        用于标识待卸载应用的id
 */
- (void) uninstallApplication:(CDVInvokedUrlCommand*)command;

/**
    启动一个应用
    @param command.arguments
      - 0 NSString* appId        用于标识待启动应用的id
 */
- (void) startApplication:(CDVInvokedUrlCommand*)command;

/**
    获取已安装的应用.
    获取到的应用不包括默认应用.
 */
- (void) listInstalledApplications:(CDVInvokedUrlCommand*)command;

/**
    列出默认应用可以使用的所有应用预置包
    列表中每一项为一个应用包的相对路径，这些应用包位于默认应用工作目录的pre_set目录下
 */
- (void) listPresetAppPackages:(CDVInvokedUrlCommand*)command;

/**
    获取默认应用的描述信息）
 */
- (void) getStartAppInfo:(CDVInvokedUrlCommand*)command;

@end