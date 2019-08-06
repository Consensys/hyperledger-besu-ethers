"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var privateProvider_1 = require("./privateProvider");
var PantheonProvider = /** @class */ (function (_super) {
    __extends(PantheonProvider, _super);
    function PantheonProvider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // Pantheon administration
    PantheonProvider.prototype.addPeer = function (enodeUrl) {
        return this._runPerform("addPeer", {
            enodeUrl: function () { return Promise.resolve(enodeUrl); }
        });
    };
    PantheonProvider.prototype.changeLogLevel = function (level) {
        return this._runPerform("changeLogLevel", {
            level: function () { return Promise.resolve(level); }
        });
    };
    PantheonProvider.prototype.getNodeInfo = function () {
        return this._runPerform("getNodeInfo", {});
    };
    PantheonProvider.prototype.getPeers = function () {
        return this._runPerform("getPeers", {});
    };
    PantheonProvider.prototype.removePeer = function (enodeUrl) {
        return this._runPerform("removePeer", {
            enodeUrl: function () { return Promise.resolve(enodeUrl); }
        });
    };
    PantheonProvider.prototype.getModuleVersions = function () {
        return this._runPerform("getModuleVersions", {});
    };
    PantheonProvider.prototype.getPantheonStatistics = function () {
        return this._runPerform("getPantheonStatistics", {});
    };
    PantheonProvider.prototype.getPantheonTransactions = function () {
        return this._runPerform("getPantheonTransactions", {});
    };
    // Override the base perform method to add the pantheon API calls
    PantheonProvider.prototype.perform = function (method, params) {
        switch (method) {
            // Pantheon administration
            case "addPeer":
                return this.send("admin_addPeer", [
                    params.enodeUrl
                ]);
            case "changeLogLevel":
                return this.send("admin_changeLogLevel", [
                    params.level
                ]);
            case "getNodeInfo":
                return this.send("admin_nodeInfo", []);
            case "getPeers":
                return this.send("admin_peers", []);
            case "removePeer":
                return this.send("admin_removePeer", [
                    params.enodeUrl
                ]);
            case "getModuleVersions":
                return this.send("rpc_modules", []);
            case "getPantheonStatistics":
                return this.send("txpool_pantheonStatistics", []);
            case "getPantheonTransactions":
                return this.send("txpool_pantheonTransactions", []);
            default:
                return _super.prototype.perform.call(this, method, params);
        }
    };
    return PantheonProvider;
}(privateProvider_1.PrivateJsonRpcProvider));
exports.PantheonProvider = PantheonProvider;
