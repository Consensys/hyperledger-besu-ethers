
import { PrivateJsonRpcProvider }  from './privateProvider'

export interface NodeInfo {
    enode: string,
    listenAddr: string,
    name : string,
    id: string,
    ports: {
        discovery: number
        listener: number
    },
    protocols: object[]
}

export interface PeerInfo {
    version: string,
    name: string,
    caps : string[],
    network: {
        localAddress: string,
        remoteAddress: string,
    },
    port: string,
    id: string,
}

export interface PantheonStatistics {
    maxSize: number,
    localCount: number,
    remoteCount: number,
}

export interface PantheonTransaction {
    hash: string,
    isReceivedFromLocalSource: boolean,
    addedToPoolAt: string,
}

export class PantheonProvider extends PrivateJsonRpcProvider {

    // Pantheon administration
    addPeer(
        enodeUrl: string | Promise<string>,
    ): Promise<boolean> {
        return this._runPerform("addPeer", {
            enodeUrl: () => Promise.resolve(enodeUrl)
        });
    }

    changeLogLevel(
        level: string | Promise<string>,
    ): Promise<boolean> {
        return this._runPerform("changeLogLevel", {
            level: () => Promise.resolve(level)
        });
    }

    getNodeInfo(): Promise<NodeInfo> {
        return this._runPerform("getNodeInfo", {});
    }

    getPeers(): Promise<PeerInfo[]> {
        return this._runPerform("getPeers", {});
    }

    removePeer(
        enodeUrl: string | Promise<string>,
    ): Promise<PeerInfo[]> {
        return this._runPerform("removePeer", {
            enodeUrl: () => Promise.resolve(enodeUrl)
        });
    }

    getModuleVersions(): Promise<object> {
        return this._runPerform("getModuleVersions", {});
    }

    getPantheonStatistics(): Promise<PantheonStatistics> {
        return this._runPerform("getPantheonStatistics", {});
    }

    getPantheonTransactions(): Promise<PantheonTransaction[]> {
        return this._runPerform("getPantheonTransactions", {});
    }

    // Override the base perform method to add the pantheon API calls
    perform(method: string, params: any): Promise<any> {
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
                return super.perform(method, params)
        }
    }
}
