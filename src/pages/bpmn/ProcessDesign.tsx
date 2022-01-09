/* eslint-disable no-underscore-dangle */
import React from 'react';
import { Modal } from 'antd';
import lintModule from 'bpmn-js-bpmnlint';
import CustomModeler from './customModeler';
import CustomProperties from './customProperties';
import flowableModdle from './resource/flowable.json';
import minimapModule from './minimap';
import EditingTools from './editTool';
import styles from './index.module.less';
import bpmnlintConfig from '../../../.bpmnlintrc';

export interface ProcessDesignProps {
  XML: string
}

export default class ProcessDesign extends React.Component<ProcessDesignProps, { activeNodeEle?: unknown }> {
  modeler: any;
  constructor(props: ProcessDesignProps) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    this.modeler = new CustomModeler({
      container: '#bpmnContainer',
      propertiesPanel: {
        parent: '#properties-panel',
      },
      additionalModules: [
        lintModule, // 校验模块
        minimapModule // 自定义小地图模块
      ],
      linting: {
        bpmnlint: bpmnlintConfig,
      },
      moddleExtensions: {
        flowable: flowableModdle,
      }
    });
    // 移除官方logo
    const logo = document.querySelector('.bjs-powered-by');
    const bpmnContainer = document.querySelector('.bjs-container');
    if (bpmnContainer && logo) {
      bpmnContainer.removeChild(logo);
    }
    this.renderDiagram();
    this.addModelerListener();
  }

  // 监听节点属性变化
  addModelerListener = () => {
    const bpmnModeler = this.modeler;
    const events = ['element.click', 'element.changed'];
    events.forEach((eventType) => {
      bpmnModeler.on(eventType, (e) => {
        const { element } = e;
        const { type } = element;
        if (type !== 'label') {
          this.setState({
            activeNodeEle: element
          });
        }
      });
    });
  };

  // 默认当前节点为流程的根节点
  initActiveNode = () => {
    const canvas = this.modeler.get('canvas');
    const rootElement = canvas.getRootElement();
    this.setState({
      activeNodeEle: rootElement
    });
  };

  // 初始化导入xml文件
  renderDiagram = async () => {
    try {
      const { XML } = this.props;
      const result = await this.modeler.importXML(XML);
      const { warnings } = result;
      this.initActiveNode();
    } catch (err) {
      Modal.error({ title: 'XML解析失败' });
      console.log(err.message, err.warnings);
    }
  };

  // 更新xml
  updateProperties = (value: any) => {
    const modeling = this.modeler.get('modeling');
    const { activeNodeEle } = this.state;
    if (activeNodeEle) {
      modeling.updateProperties(activeNodeEle, value);
    }
  };

  getBpmnXML = (): Promise<string> => {
    const bpmnModeler = this.modeler;
    return new Promise(async (resolve, reject) => {
      if (bpmnModeler._customElements != null && bpmnModeler._customElements.length > 0) {
        // 将自定义的元素 加入到 _definitions
        bpmnModeler._definitions.rootElements[0].flowElements = bpmnModeler._definitions.rootElements[0].flowElements.concat(
          bpmnModeler._customElements[0],
        );
      }
      const { err, xml } = await bpmnModeler.saveXML({ format: true });
      if (err) {
        reject(err);
      }
      resolve(xml);
    });
  };

  saveBpmnXML = async () => {
    const xml = await this.getBpmnXML();
    console.log(xml, '保存xml');
  };

  // 创建节点和连线
  // createBranchByShape = (modeler, element) => {
  //   const canvas = modeler.get("canvas")
  //   const elementFactory = modeler.get("elementFactory")
  //   const modeling = modeler.get("modeling")
  //   const rootElement = canvas.getRootElement()
  //   const createTaskShape = (x: number, y: number) => {
  //     let branchShape = elementFactory.createShape({
  //       type: "bpmn:Task"
  //     });
  //     branchShape.businessObject.name = "节点名称";
  //     return modeling.createShape(
  //       branchShape,
  //       {
  //         x: element.x + x,
  //         y: element.y + y
  //       },
  //       rootElement
  //     )
  //   }
  //   let shape = modeler.get('elementRegistry').get(element.id)
  //   let taskShape1 = createTaskShape(150, 160)
  //   let taskShape2 = createTaskShape(150, -70)
  //   modeling.connect(shape, taskShape1)
  //   modeling.connect(shape, taskShape2)
  // }

  render() {
    const { activeNodeEle } = this.state;

    // console.log(this.modeler?.get("translate"))
    return (
      <>
        <div className={styles.editToolContainer}>
          <EditingTools onSave={this.saveBpmnXML} modeler={this.modeler} />
        </div>
        <div className={styles.processContainer}>
          <div className={styles.bpmnContainer} id="bpmnContainer" />
          <aside className={styles.aside}>
            <div className={styles.panelContainer} id="properties-panel">
              <CustomProperties modeler={this.modeler} updateProperties={this.updateProperties} activeNodeEle={activeNodeEle} />
            </div>
          </aside>
        </div>
      </>
    );
  }
};

