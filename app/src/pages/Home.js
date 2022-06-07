import React from "react";

import { Checkbox } from "rsuite";

import "./Home.css";

class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            themes: [],
        }

        window.manager.on("updateThemes", themes => this.setState({ themes }));
    }

    render() {
        return (
            <div id="Home">
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