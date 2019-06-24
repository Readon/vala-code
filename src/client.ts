import {
    LanguageClient,
    LanguageClientOptions,
    StreamInfo,
    Trace,
    ServerOptions,
    TransportKind,
    RevealOutputChannelOn
} from 'vscode-languageclient';

import {
    ExtensionContext
} from 'vscode'

import * as path from 'path'
import * as net from 'net';

export class ValaLanguageClient {

    ls: LanguageClient | null

    constructor(context: ExtensionContext) {

        //let serverModule = context.asAbsolutePath(path.join('vala-language-server', 'build', 'vala-language-server'));
        //let gvlsModule = context.asAbsolutePath(path.join('gvls', 'build', 'src', 'lsp', 'org.gnome.GVls.exe'));
        let gvlsModule = context.asAbsolutePath(path.join('gvls', 'org.gnome.GVls.exe'));

        let clientOptions: LanguageClientOptions = {
            documentSelector: ['vala'],
            revealOutputChannelOn: RevealOutputChannelOn.Info
        };

        let serverOptions: ServerOptions = {
            run: {
                //command: serverModule,
                command: gvlsModule,
                transport: {
                    kind: TransportKind.socket,
                    port:1024
                }
            },
            debug: {
                //command: serverModule,
                command: gvlsModule,
                options: {
                    env: {
                        G_MESSAGES_DEBUG: 'all',
                        JSONRPC_DEBUG: 1
                    }
                },
                transport: {
                    kind: TransportKind.socket,
                    port:1024
                }
            }
        };

        const port = 10240;
        const connectToLanguageServer: ServerOptions = function() {
            return new Promise((resolve, reject) => {
                var client = new net.Socket();
                client.connect(port, "127.0.0.1", function() {
                    resolve({
                        reader: client,
                        writer: client
                    });
                });
            });
        }

        //this.ls = new LanguageClient('Vala Language Server', serverOptions, clientOptions)
        this.ls = new LanguageClient('Vala Language Server', connectToLanguageServer, clientOptions)        
        this.ls.trace = Trace.Verbose;

        this.ls.start()
    }

    dispose() {
        this.ls!.stop()

        this.ls = null
    }
}
