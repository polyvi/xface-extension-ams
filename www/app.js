
/*
 This file was modified from or inspired by Apache Cordova.

 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements. See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership. The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied. See the License for the
 specific language governing permissions and limitations
 under the License.
*/

/**
 * @module app
 */

 /**
  * 该类提供一系列基础api，用于进行xface app通信以及监听xface app的启动、关闭事件（Android, iOS）<br/>
  * 该类不能通过new来创建相应的对象，只能通过xFace.app对象来直接使用该类中定义的方法
  * @class App
  * @namespace xFace
  * @platform Android, iOS, WP8
  * @since 3.0.0
  */
var channel = require('cordova/channel');

/**
 * 当前应用收到其它应用发送的消息时，该事件被触发（Android, iOS, WP8）<br/>
 * 注意：只支持主应用与普通应用之间进行通信
 * @example
        function handler(data) {
            console.log("Received message: " + data);
        }
        xFace.app.addEventListener("message", handler);
 * @event message
 * @param {String} data 其它应用发送的数据
 * @platform Android, iOS, WP8
 * @since 3.0.0
 */
var message = channel.create("message");
/**
 * 当一个应用启动时，该事件被触发（Android, iOS, WP8）<br/>
 * 注意：只有主应用能够监听该事件
 * @example
        function handler() {
            console.log("One app has started!");
        }
        xFace.app.addEventListener("start", handler);
 * @event start
 * @platform Android, iOS, WP8
 * @since 3.0.0
 */
var start = channel.create("start");
/**
 * 当一个应用关闭时，该事件被触发（Android, iOS, WP8）<br/>
 * 注意：只有主应用能够监听该事件
 * @example
        function handler() {
            console.log("One app has closed!");
        }
        xFace.app.addEventListener("close", handler);
 * @event close
 * @platform Android, iOS, WP8
 * @since 3.0.0
 */
var close = channel.create("close");

/**
 * 在库模式中，当前应用收到第三方程序发送的消息时，该事件被触发（Android, iOS）<br/>
 * @example
        function handler(data) {
            console.log("Received message: " + data);
        }
        xFace.app.addEventListener("client", handler);
 * @event client
 * @param {String} data 第三方程序发送的数据
 * @platform Android, iOS
 * @since 3.1.20
 */
var client = channel.create("client");//FIXME:添加client事件后，将app.js定义在ams扩展中是否合适？

var app =
{
    /**
     * 注册应用相关的事件监听器（Android, iOS, WP8）
     * @example
            function handler(data) {
                console.log("Received message: " + data);
            }
            xFace.app.addEventListener("message", handler);
     * @method addEventListener
     * @param {String} evt 事件类型，仅支持"message", "start", "close"
     * @param {Function} handler 事件触发时的回调函数
     * @param {String} handler.data 当注册的事件为"message"事件或“client”事件时有效，用于接收应用之间或xFace和第三方程序通信时传递的数据
     * @platform Android, iOS, WP8
     * @since 3.0.0
     */
    addEventListener:function(evt, handler){
        var e = evt.toLowerCase();
        if(e == "message"){
            message.subscribe(handler);
        }else if(e == "start"){
            start.subscribe(handler);
        }else if(e == "close"){
            close.subscribe(handler);
        }else if(e == "client"){
            client.subscribe(handler);
        }
    },

    /**
     * 注销应用相关的事件监听器（Android, iOS, WP8）
     * @example
            function handler(data) {
                console.log("Received message: " + data);
            }
            xFace.app.addEventListener("message", handler);

            // do something ......

            xFace.app.removeEventListener("message", handler);
     * @method removeEventListener
     * @param {String} evt 事件类型，支持"message", "start", "close"
     * @param {Function} handler 要注销的事件监听器<br/>
     *  （该事件监听器通过{{#crossLink "xFace.App/addEventListener"}}{{/crossLink}}接口注册过）
     * @platform Android, iOS, WP8
     * @since 3.0.0
     */
    removeEventListener:function(evt, handler){
        var e = evt.toLowerCase();
        if(e == "message"){
            message.unsubscribe(handler);
        }else if(e == "start"){
            start.unsubscribe(handler);
        }else if(e == "close"){
            close.unsubscribe(handler);
        }else if(e == "client"){
            client.unsubscribe(handler);
        }

    },

    /**
     * 引擎触发应用相关事件的入口函数
     * param {String} evt 事件类型，支持"message", "start", "close"
     * param {String} arg 事件参数。
     *                对于message事件，该参数是消息的id；<br/>
     *                对于client事件，该参数是信息内容。 <br/>
     */
    fireAppEvent: function(evt, arg){
        var e = evt.toLowerCase();
        if( e == "message"){
           var data = localStorage.getItem(arg);
           localStorage.removeItem(arg);
           message.fire(data);
        }else if(e == "start"){
            start.fire();
        }else if(e == "close"){
            close.fire();
        }else if(e == "client"){
            client.fire(arg);
        }
    },

    /**
     * 向其它应用发送消息（Android, iOS, WP8）<br/>
     * 注意：<br/>
     * 1. 只支持主应用与子应用之间进行通信 <br/>
     * 2. 若是主应用发送给子应用，则所有子应用都能收到message
     * @example
            xFace.app.sendMessage("This is the message content sent to another app!", null);
     * @method sendMessage
     * @param {Object} data 要发送的消息内容
     * @param {String} [appid] 消息发送的目标应用的应用id（目前不支持该参数）
     * @platform Android, iOS, WP8
     * @since 3.0.0
     */
    sendMessage:function(data, appid){

        function toString(data)
        {
            var result;
            if( typeof data == 'string'){
                result = data;
            }else if( data !== null && typeof data == 'object'){
                result = data.toString();
            }
            return result;

        }
        function generateUniqueMsgId()
        {
            var msgId = parseInt((Math.random() * 65535), 10).toString(10);
            while(null !== localStorage.getItem(msgId))
            {
                 msgId = parseInt((Math.random() * 65535), 10).toString(10);
            }
            return msgId;
        }

        var args = arguments;
        if(args.length === 1){
            //如果是portal,则消息接收者是所有的app，如果是app，则消息接收者是portal
            var msgId = generateUniqueMsgId();
            localStorage.setItem(msgId, toString(data));
            require('xFace/plugin/privateModule').execCommand("xFace_app_send_message:", [msgId]);
        }else if(args.length === 2){
            //TODO
            //发送消息给指定的app
            alert('specified app');
        }
    }
};
module.exports = app;
