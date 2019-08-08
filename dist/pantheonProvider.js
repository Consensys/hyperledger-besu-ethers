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
    // Miscellaneous
    PantheonProvider.prototype.getModuleVersions = function () {
        return this._runPerform("getModuleVersions", {});
    };
    // Txpool
    PantheonProvider.prototype.getPantheonStatistics = function () {
        return this._runPerform("getPantheonStatistics", {});
    };
    PantheonProvider.prototype.getPantheonTransactions = function () {
        return this._runPerform("getPantheonTransactions", {});
    };
    // Clique
    PantheonProvider.prototype.cliqueDiscard = function (signerAddress) {
        return this._runPerform("cliqueDiscard", {
            signerAddress: function () { return Promise.resolve(signerAddress); }
        });
    };
    PantheonProvider.prototype.cliqueGetSigners = function (blockParameter) {
        return this._runPerform("cliqueGetSigners", {
            blockParameter: function () { return Promise.resolve(blockParameter); }
        });
    };
    PantheonProvider.prototype.cliqueGetSignersAtHash = function (hash) {
        return this._runPerform("cliqueGetSigners", {
            hash: function () { return Promise.resolve(hash); }
        });
    };
    PantheonProvider.prototype.cliquePropose = function (signerAddress, add) {
        return this._runPerform("cliquePropose", {
            signerAddress: function () { return Promise.resolve(signerAddress); },
            add: function () { return Promise.resolve(add); },
        });
    };
    PantheonProvider.prototype.cliqueGetProposals = function () {
        return this._runPerform("cliqueGetProposals", {});
    };
    // IBFT
    PantheonProvider.prototype.ibftDiscardValidatorVote = function (validatorAddress) {
        return this._runPerform("ibftDiscardValidatorVote", {
            validatorAddress: function () { return Promise.resolve(validatorAddress); }
        });
    };
    PantheonProvider.prototype.ibftGetPendingVotes = function () {
        return this._runPerform("ibftGetPendingVotes", {});
    };
    PantheonProvider.prototype.ibftGetValidatorsByBlockHash = function (hash) {
        return this._runPerform("ibftGetValidatorsByBlockHash", {
            hash: function () { return Promise.resolve(hash); }
        });
    };
    PantheonProvider.prototype.ibftGetValidatorsByBlockNumber = function (blockParameter) {
        return this._runPerform("ibftGetValidatorsByBlockNumber", {
            blockParameter: function () { return Promise.resolve(blockParameter); }
        });
    };
    PantheonProvider.prototype.ibftProposeValidatorVote = function (validatorAddress, add) {
        return this._runPerform("ibftProposeValidatorVote", {
            validatorAddress: function () { return Promise.resolve(validatorAddress); },
            add: function () { return Promise.resolve(add); },
        });
    };
    // Permissioning
    PantheonProvider.prototype.addAccountsToWhitelist = function (accounts) {
        return this._runPerform("addAccountsToWhitelist", {
            accounts: function () { return Promise.resolve(accounts); },
        });
    };
    PantheonProvider.prototype.getAccountsWhitelist = function () {
        return this._runPerform("getAccountsWhitelist", {});
    };
    PantheonProvider.prototype.removeAccountsFromWhitelist = function (accounts) {
        return this._runPerform("removeAccountsFromWhitelist", {
            accounts: function () { return Promise.resolve(accounts); },
        });
    };
    PantheonProvider.prototype.addNodesToWhitelist = function (nodes) {
        return this._runPerform("addNodesToWhitelist", {
            nodes: function () { return Promise.resolve(nodes); },
        });
    };
    PantheonProvider.prototype.getNodesWhitelist = function () {
        return this._runPerform("getNodesWhitelist", {});
    };
    PantheonProvider.prototype.removeNodesFromWhitelist = function (nodes) {
        return this._runPerform("removeNodesFromWhitelist", {
            nodes: function () { return Promise.resolve(nodes); },
        });
    };
    PantheonProvider.prototype.reloadPermissionsFromFile = function () {
        return this._runPerform("reloadPermissionsFromFile", {});
    };
    // Override the base perform method to add the pantheon API calls
    PantheonProvider.prototype.perform = function (method, params) {
        switch (method) {
            // Pantheon administration
            case "addPeer":
                return this.send("admin_addPeer", [
                    params.enodeUrl,
                ]);
            case "changeLogLevel":
                return this.send("admin_changeLogLevel", [
                    params.level,
                ]);
            case "getNodeInfo":
                return this.send("admin_nodeInfo", []);
            case "getPeers":
                return this.send("admin_peers", []);
            case "removePeer":
                return this.send("admin_removePeer", [
                    params.enodeUrl,
                ]);
            // Miscellaneous
            case "getModuleVersions":
                return this.send("rpc_modules", []);
            // Txpool
            case "getPantheonStatistics":
                return this.send("txpool_pantheonStatistics", []);
            case "getPantheonTransactions":
                return this.send("txpool_pantheonTransactions", []);
            // Clique
            case "cliqueDiscard":
                return this.send("clique_discard", [
                    params.signerAddress,
                ]);
            case "cliqueGetSigners":
                return this.send("clique_getSigners", [
                    params.blockParameter,
                ]);
            case "cliqueGetSignersAtHash":
                return this.send("clique_getSignersAtHash", [
                    params.hash,
                ]);
            case "cliquePropose":
                return this.send("clique_propose", [
                    params.signerAddress,
                    params.add,
                ]);
            case "cliqueProposals":
                return this.send("clique_proposals", []);
            // IBFT
            case "ibftDiscardValidatorVote":
                return this.send("ibft_discardValidatorVote", [
                    params.validatorAddress,
                ]);
            case "ibftGetPendingVotes":
                return this.send("ibft_getPendingVotes", []);
            case "ibftGetValidatorsByBlockHash":
                return this.send("ibft_getValidatorsByBlockHash", [
                    params.hash,
                ]);
            case "ibftGetValidatorsByBlockNumber":
                return this.send("ibft_getValidatorsByBlockNumber", [
                    params.blockParameter,
                ]);
            case "ibftProposeValidatorVote":
                return this.send("ibft_proposeValidatorVote", [
                    params.validatorAddress,
                    params.add,
                ]);
            // Permissioning
            case "addAccountsToWhitelist":
                return this.send("perm_addAccountsToWhitelist", [params.accounts]);
            case "getAccountsWhitelist":
                return this.send("perm_getAccountsWhitelist", []);
            case "removeAccountsFromWhitelist":
                return this.send("perm_removeAccountsFromWhitelist", [params.accounts]);
            case "addNodesToWhitelist":
                return this.send("perm_addAccountsToWhitelist", [params.nodes]);
            case "getNodesWhitelist":
                return this.send("perm_getAccountsWhitelist", []);
            case "removeNodesFromWhitelist":
                return this.send("perm_removeAccountsFromWhitelist", [params.nodes]);
            case "reloadPermissionsFromFile":
                return this.send("perm_reloadPermissionsFromFile", []);
            default:
                return _super.prototype.perform.call(this, method, params);
        }
    };
    return PantheonProvider;
}(privateProvider_1.PrivateJsonRpcProvider));
exports.PantheonProvider = PantheonProvider;
