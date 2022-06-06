import React from "react";

import './App.css';

import 'rsuite/dist/rsuite.css';

import restoreIcon from '../public/restore.png';
import closeIcon from '../public/close.png';
import maxIcon from '../public/max.png';
import minIcon from '../public/min.png';
import Icon from '../public/icon.png';

import { Table, CustomProvider, Button, Checkbox } from 'rsuite';

class App extends React.Component {
	constructor(props) {		
		super(props);

        this.state = {
			maximized: false,
			refs: {
				files: React.createRef()
			},
            width: window.innerWidth,
		}

        window.addEventListener("resize", () => {
            clearTimeout(window.resizeFinished);
            window.resizeFinished = setTimeout(() => {
                this.setState({
                    width: window.innerWidth,
                    loading: true
                })
            }, 200)
        })

        this.handleClick     = this.handleClick.bind(this);
		this.minimize        = this.minimize.bind(this);
		this.maximize        = this.maximize.bind(this);
		this.openTab         = this.openTab.bind(this);
		this.onHover         = this.onHover.bind(this);
		this.close           = this.close.bind(this);
		this.send            = this.send.bind(this);

    }

    componentDidMount() {
		this.setState({
			tabs: {
				files: document.getElementById('file-tab'),
			}
		})

		document.addEventListener('mousedown', this.handleClick);
	}

    
	send(op, data) {
		window.socket.send(JSON.stringify({op, data}));
	}

	minimize() {
		this.send('min', {});
	}

	maximize() {
		document.getElementById('max-png').src = this.state.maximized ? maxIcon : restoreIcon;
		this.send(this.state.maximized ? 'restore' : 'max', {});

		this.setState({
			maximized: !this.state.maximized
		})
	}

	close() {
		this.send('close', {});
	}

    handleClick(event) {
		if (this.openRef && !this.openRef.current.contains(event.target)) {
			this.state.openTab.style.visibility = 'hidden';
			this.setState({
				openTab: null
			})
			this.openRef = null;
		}
	}

    onHover(tab) {
		if (this.state.openTab && this.state.tabs[tab] != this.state.openTab) {
			this.openTab(tab);
		}
	}

	openTab(tab) {
		for (let tabName in this.state.tabs) {
			let entry = this.state.tabs[tabName];
			
			entry.style.visibility = tabName == tab ? 'visible' : 'hidden';

			if (tabName == tab) {
				if (this.state.openTab == entry) {
					entry.style.visibility = 'hidden';
					this.setState({
						openTab: null,
					})
					this.openRef = null;
				} else {
					this.setState({
						openTab: entry
					})
					this.openRef = this.state.refs[tabName];
				}
			}
		}
    }

    render() {
		return (
			<CustomProvider theme="dark" className="App">
				<div id="Wrapper">
					<div id="tabs">
						<div id='file-tab' ref={this.state.refs.files}>
							<button class='tab-entry' onClick={this.openFile}>
								<p class='tab-title'>Open Theme</p>
								<p class='tab-keybind'>Ctrl + O</p>
							</button>
							<button class='tab-entry' onClick={this.openFile}>
								<p class='tab-title'>Theme Editor</p>
							</button>
						</div>
					</div>
					<div id='title'>
						<p id='title-text'>Studio Theme Manager</p>
						<div id='title-left'>
							<div id='icon-wrapper'>
								<img id='icon' src={Icon} />
							</div>
							<div id='navigation-wrapper'>
								<button id='file' class='button-left' onMouseOver={() => this.onHover('files')} onClick={() => this.openTab('files')}>File</button>
							</div>
						</div>
						<div id='title-right'>
							<div id='button-wrapper'>
								<button id='min' onClick={this.minimize}><img id ='min-png' src={minIcon}/></button>
								<button id='max' onClick={this.maximize}><img id='max-png' src={maxIcon}/></button>
								<button id='close' onClick={this.close}><img id='close-png' src={closeIcon}/></button>
							</div>
						</div>
					</div>
					<div id='drag'></div>
                    <div id="table-wrapper">
                       
                    </div>
				</div>
            </CustomProvider>
		);
	}
}

export default App;