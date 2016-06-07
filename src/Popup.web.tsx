import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Modal from 'rc-dialog';
import {addEventListener, contains, noop} from './utils.web';

export interface PopupPickerProps {
  dismissText?:string;
  okText?:string;
  title?:string;
  style?:CSSStyleDeclaration;
  prefixCls?:string;
  visible?:boolean;
  onOk?:() => void;
  onVisibleChange?:(visible:boolean) => void;
  content?:React.ReactElement<any>|string;
  onDismiss?:() => void;
  popupTransitionName?:string;
  maskTransitionName?:string;
}

export interface PopupPickerState {
  visible:boolean;
}

export default class PopupPicker extends React.Component<PopupPickerProps, PopupPickerState> {
  static defaultProps = {
    prefixCls: 'rmc-picker-popup',
    onVisibleChange: noop,
    okText: 'Ok',
    dismissText: 'Dismiss',
    title: '',
    style: {},
    onOk: noop,
    onDismiss: noop,
  };

  popupContainer:HTMLElement;

  modalContent:HTMLElement;

  onDocumentClickListener:{
    remove:() => void;
  };

  constructor(props:PopupPickerProps) {
    super(props);
    this.state = {
      visible: props.visible || false,
    };
  }

  componentDidMount() {
    this.popupContainer = document.createElement('div');
    document.body.appendChild(this.popupContainer);
  }

  componentWillReceiveProps(nextProps) {
    if ('visible' in nextProps) {
      this.setVisibleState(nextProps.visible);
    }
  }

  componentDidUpdate() {
    if (this.state.visible) {
      if (!this.onDocumentClickListener) {
        this.onDocumentClickListener = addEventListener(document, 'click', this.onDocumentClick);
      }
      ReactDOM.render(this.getModal(), this.popupContainer);
    } else {
      if (this.onDocumentClickListener) {
        this.onDocumentClickListener.remove();
        this.onDocumentClickListener = null;
      }
      ReactDOM.unmountComponentAtNode(this.popupContainer);
    }
  }

  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(this.popupContainer);
    document.body.removeChild(this.popupContainer);
  }

  onOk = () => {
    this.fireVisibleChange(false);
    this.props.onOk();
  };

  onDismiss = () => {
    this.fireVisibleChange(false);
    this.props.onDismiss();
  };

  onTriggerClick = (e) => {
    this.fireVisibleChange(!this.state.visible);
    const child = React.Children.only(this.props.children);
    const childProps = child.props || {};
    if (childProps.onClick) {
      childProps.onClick(e);
    }
  };

  onDocumentClick = (e) => {
    if (e.target !== this.modalContent && !contains(this.modalContent, e.target)) {
      this.fireVisibleChange(false);
    }
  };

  setVisibleState(visible) {
    this.setState({
      visible,
    });
  }

  getModal() {
    const props = this.props;
    return (<Modal
      prefixCls={`${props.prefixCls}`}
      visible
      transitionName={props.popupTransitionName}
      maskTransitionName={props.maskTransitionName}
      closable={false}
      style={props.style}
    >
      <div ref={this.saveModalContent}>
        <div className={`${props.prefixCls}-header`}>
          <div className={`${props.prefixCls}-item`} onClick={this.onDismiss}>
            {props.dismissText}
          </div>
          <div className={`${props.prefixCls}-item ${props.prefixCls}-title`}>{props.title}</div>
          <div className={`${props.prefixCls}-item`} onClick={this.onOk}>
            {props.okText}
          </div>
        </div>
        {this.props.content}
      </div>
    </Modal>);
  }

  saveModalContent = (content) => {
    this.modalContent = content;
  };

  fireVisibleChange(visible) {
    if (this.state.visible !== visible) {
      if (!('visible' in this.props)) {
        this.setVisibleState(visible);
      }
      this.props.onVisibleChange(visible);
    }
  }

  render() {
    const props = this.props;
    const children = props.children;
    if (!children) {
      return null;
    }
    const child = React.Children.only(children);
    const newChildProps = {
      onClick: this.onTriggerClick,
    };
    return React.cloneElement(child, newChildProps);
  }
}
