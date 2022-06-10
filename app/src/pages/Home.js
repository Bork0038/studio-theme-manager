import React from "react";

import { Checkbox, Progress } from "rsuite";

import "./Home.css";

class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            themes: [],
            loading: false,
            steps: 0,
            totalSteps: 1
        }

        window.manager.on("updateThemes", themes => this.setState({ themes }));
        window.manager.on("step", data => this.setState(data));
        window.manager.on("loaded", () => this.setState({ loading: false, steps: 0 }));
    }

    render() {
        return (
            <div id="Home">
                {
                    this.state.loading ? <div id="Darken"> 
                        <div id="Loading-wrapper">
                            <p id="Loading-text">Applying Theme...</p>
                            <div id="Loading-progress-wrapper">
                               <Progress.Line percent={(this.state.steps / this.state.totalSteps * 100).toFixed()} />
                            </div>
                        </div>
                    </div> : ""
                }
                <div id="Home-inner">
                    <div id="Home-header">
                        <p id="Home-p1">Theme Name</p>
                        <p id="Home-p2">File Path</p>
                        <p id="Home-p3">Enabled</p>
                    </div>
                    <div id="Home-scroll">
                       {
                            this.state.themes.map(val => {
                                return <div class="Home-theme">
                                    <p class="Home-theme-name">{val.name}</p>
                                    <p class="Home-theme-file">{val.path}</p>
                                    <div class="Home-theme-check-wrapper" style={{
                                        lineHeight: "44px"
                                    }}>
                                        <div class="Home-theme-check-inner">
                                            <Checkbox 
                                                class="Home-theme-check" 
                                                inline 
                                                checked={val.enabled}
                                                onChange={
                                                    () => {
                                                        if (!this.state.loading) {
                                                            const themes = this.state.themes;
                                                            for (let theme of themes) {
                                                                if (theme.path == val.path) {
                                                                    theme.enabled = !val.enabled;
                                                                }
                                                            }
    
                                                            for (let theme of themes) {
                                                                if (theme.path != val.path && val.enabled) {
                                                                    theme.enabled = false;
                                                                }
                                                            }
    
                                                            window.socket.send(JSON.stringify({
                                                                op: "setTheme",
                                                                data: val.data
                                                            }))
                                                            this.setState({ themes, current: val.path, loading: true });                                                 
                                                        }
                                                    }
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                           })
                       }
                    </div>
                </div>
            </div>
        )
    }
}

export default Home;