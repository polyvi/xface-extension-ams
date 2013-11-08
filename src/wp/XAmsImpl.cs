using System;
using System.IO;
using xFaceLib.runtime;
using xFaceLib.ams;
using xFaceLib.Util;

namespace xFaceLib.extensions.ams
{
    /// <summary>
    /// 为ams extension需要的ams相关功能提供实现
    /// </summary>
    public class XAmsImpl : XAms
    {
        private XAppManagement appManagement;

        public XAmsImpl(XAppManagement appManagement)
        {
            this.appManagement = appManagement;
        }

        public AMS_ERROR StartApp(String appId, String appparams)
        {
            return appManagement.StartApp(appId, XStartParams.Parse(appparams));
        }

        public void InstallApp(XApplication app, String path, XAppInstallListener listener)
        {
            String tmp = ResolvePathUsingWorkspace(app.GetWorkSpace(), path);
            String abspath = XUtils.BuildabsPathOnIsolatedStorage(tmp);
            appManagement.InstallApp(abspath, listener);
        }

        public void UpdateApp(XApplication app, String path, XAppInstallListener listener)
        {
            String tmp = ResolvePathUsingWorkspace(app.GetWorkSpace(), path);
            String abspath = XUtils.BuildabsPathOnIsolatedStorage(tmp);
            appManagement.UpdateApp(abspath, listener);
        }

        public void UninstallApp(String appId, XAppInstallListener listener)
        {
            appManagement.UninstallApp(appId, listener);
        }

        public void CloseApp(String appId)
        {
            appManagement.CloseApp(appId);
        }

        public XApplicationList GetAppList()
        {
            return appManagement.GetAppList();
        }

        public bool CanExecuteAmsBy(XApplication app)
        {
            return appManagement.IsDefaultApp(app) ? true : false;
        }

        public String[] GetPresetAppPackages()
        {
            return appManagement.GetPresetAppPackages();
        }

        public XAppInfo GetDefaultAppInfo()
        {
            return appManagement.GetAppList().GetDefaultApp().AppInfo;
        }
        /// <summary>
        /// 转换path到app的workspace下
        /// </summary>
        /// <param name="workspace">app的workspace</param>
        /// <param name="path">待转换的path</param>
        /// <returns>返回相对独立存储，以app的workspace开头的path</returns>
        String ResolvePathUsingWorkspace(String workspace,String path)
        {
            string resolvedPath = XUtils.ResolvePath(workspace, path);
            if (String.IsNullOrEmpty(path))
            {
                return workspace;
            }
            return resolvedPath;
        }
    }
}
