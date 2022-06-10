import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {VelocityComponent} from 'velocity-react';

class Container extends PureComponent {
    renderToggle() {

        return (
            <span />
        );
    }

    renderToggleDecorator() {
        return (
            <span />
        );
    }

    render() {
        const {
            style, decorators, terminal, node, onSelect, customStyles
        } = this.props;
        return (
            <div style={node.active ? {...style.container} : {...style.link}}>
                <decorators.Header node={node} style={style.header} customStyles={customStyles} onSelect={onSelect}/>
            </div>
        );
    }
}

Container.propTypes = {
    customStyles: PropTypes.object,
    style: PropTypes.object.isRequired,
    decorators: PropTypes.object.isRequired,
    terminal: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    onSelect: PropTypes.func,
    animations: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.bool
    ]).isRequired,
    node: PropTypes.object.isRequired
};

Container.defaultProps = {
    onSelect: null,
    customStyles: {}
};

export default Container;
