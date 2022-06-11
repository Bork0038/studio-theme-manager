import React from "react";

import loader from "@monaco-editor/loader";
import { MonacoLanguageClient, CloseAction, ErrorAction, MonacoServices, createConnection } from 'monaco-languageclient';
import { listen } from '@codingame/monaco-jsonrpc';
import { Treebeard, decorators } from '../treebeard';
import {includes} from 'lodash';

import { Button } from 'rsuite';


import "./Editor.css";

function hexToRgb(hex) {
    const num = parseInt(hex.slice(1), 16);

    return {
        red: ((num >> 16) & 255) / 255,
        green: ((num >> 8) & 255) / 255,
        blue: (num & 255) / 255
    }
} 

function rgbToHex(d) {
    return "#" + [d.red, d.green, d.blue].map(a => (a * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}

class Editor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: `{}`,
            active: null,
            data: {}
        }
        
        window.signalSave = () => {
            this.setState({
                saving: true
            })
        }

        window.manager.on("filesystem", data => this.setState({data}));
        window.manager.on("readfile", data => {
            window.model.setValue(data.content);
            this.modelPath = data.path;

            this.setState({
                activeFile: data.path,
                activeStart: data.content,
                loading: false
            })
        })
        window.manager.on("saved", data => {
            const node = this.state.currentNode;
            node.unsaved = false;

            this.setState({
                saving: false,
                currentNode: node
            })
        })

        loader.init().then(monaco => {
            MonacoServices.install(monaco);
   
            monaco.editor.defineTheme("theme1", {
                base: 'vs-dark',
                inherit: true,
                rules: [],
                colors: {
                    'editor.background': '#141519'
                }
            })
            
            monaco.languages.registerColorProvider("json", {
                provideColorPresentations: (model, colorInfo, token) => {
                    return [
                        {
                            label: rgbToHex(colorInfo.color)
                        }
                    ]
                },

                provideDocumentColors: (model, token) => {
                    const tokens = [];

                    const text = model.getValue();
                    const lines = text.split("\n");

                    for (let lineNumber in lines) {
                        const line = lines[lineNumber];
                        let index = -1;

                        while ((index = line.indexOf("\"#", index + 1)) >= 0) {
                            const color = line.substring(index + 1, index + 8);

                            tokens.push({
                                color: hexToRgb(color),
                                range: {
                                    startLineNumber: parseInt(lineNumber) + 1,
                                    startColumn: index + 2,
                                    endLineNumber: parseInt(lineNumber) + 1,
                                    endColumn: index + 9
                                }
                            })
                        }
                    }

                    return tokens
                }
            })

            window.model = monaco.editor.createModel("{}", 'json', monaco.Uri.parse("inmemory://model.json"));
            monaco.editor.create(document.getElementById('editor-wrapper'), {
                language: 'json',
                value: `{}`,
                theme: 'theme1',
                automaticLayout: true,
                minimap: {
                    enabled: false
                },
                glyphMargin: true,
                lightbulb: {
                    enabled: true
                },
                suggest: {
                    showClasses: true,
                    showFunctions: true,
                    showConstants: true,
                    showEnums: true,
                    showEnumMembers: true,
                    showFields: true,
                    preview: true,
                },
                inlayHints: { enabled: true },
                inlineSuggest: { enabled: true },
                renderValidationDecorations: 'on',
                model: window.model,
                colorDecorators: true
            })

            window.model.onDidChangeContent(() => {
                if (!this.state.loading && !this.state.saving && this.state.currentNode) {
                    const node = this.state.currentNode;
                    
                    node.unsaved = window.model.getValue() != this.state.activeStart;
                    this.setState({
                        currentNode: node
                    })
                }
            })
        })

        this.saveFile = this.saveFile.bind(this);
        this.onToggle = this.onToggle.bind(this);
        this.onSelect = this.onSelect.bind(this);

        document.addEventListener('keydown', (e) => {
			if ((e.metaKey || e.ctrlKey) && e.code === "KeyS") {
				this.saveFile();
			}
		})
    }

    
	saveFile() {
		window.socket.send(JSON.stringify({
            op: 'savefile', 
            data: {
			    content: window.model.getValue(),
			    path: this.modelPath
            }
		}))
	}

    onToggle(node, toggled) {
        const {cursor, data} = this.state;

        if (cursor) {
            this.setState(() => ({cursor, active: false}));
        }

        node.active = true;
        if (node.children) {
            node.toggled = toggled;
        }

        this.setState(() => ({cursor: node, data: Object.assign({}, data)}));
    }

    onSelect(node) {
        const {cursor, data} = this.state;

        if (cursor) {
            this.setState(() => ({cursor, active: false}));
            if (!includes(cursor.children, node)) {
                cursor.toggled = false;
                cursor.selected = false;
            }
        }

        node.selected = true;

        this.setState(() => ({cursor: node, data: Object.assign({}, data)}));
    }

    render() {
        const Header = ({onSelect, style, customStyles, node}) => {
            const iconStyle = {marginRight: '5px', height: '15px', marginBottom: '2px'};

            return (
                <div style={style.base} 
                    onClick={() => {
                        node.toggled = !node.toggled
                        this.setState({
                            data: Object.assign({}, this.state.data),
                        })

                        if (!node.children && node.path && !this.state.loading && !this.state.saving) {
                            this.loading = true;
                            this.setState({
                                currentNode: node,
                                loading: true
                            })
                            window.socket.send(JSON.stringify({
                                op: "readfile",
                                data: node.path
                            }))
                        }
                    }
                }>
                    <div style={node.selected ? {...style.title, ...header.title} : style.title}>
                        <img src={
                            node.children != null ? "./icons/folder.svg" : `./icons/${
                                node.name ? node.name.split('.').pop() : ''
                            }.svg`
                        } style={iconStyle} />
                        {node.name}
                        {
                            node.unsaved ? <b>  •</b> : ''
                        }
                    </div>
                </div>
            );
            
        };

        const Toggle = () => {<span />}
        
        return (
            <div id="Editor">
                <div id="top-wrapper">
                    <div id="explorer-wrapper">
                        <Treebeard
                            data={this.state.data}
                            onToggle={this.onToggle}
                            onSelect={this.onSelect}
                            decorators={{...decorators, Header, Toggle}}
                        />
                    </div>
                    <div id="editor-wrapper"></div>
                </div>
            </div>
        )
    }
}

export default Editor;