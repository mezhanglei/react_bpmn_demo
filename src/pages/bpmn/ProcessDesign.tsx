/* eslint-disable no-underscore-dangle */
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { message, Modal } from 'antd';
import lintModule from 'bpmn-js-bpmnlint';
import CustomModeler from './customModeler';
import CustomProperties from './customProperties';
import flowableModdle from './js/flowable.json';
import minimapModule from './js/minimap';
import EditingTools from './editTool';
import styles from './index.module.less';
import bpmnlintConfig from '../../../.bpmnlintrc';

const ProcessDesign = (props) => {
    const modelerRef = useRef(null);
    const [activeNodeEle, setActiveNode] = useState(null);
    const { XML, childRef } = props;

    // 监听当前事件或任务的点击或修改
    const addModelerListener = () => {
        const bpmnjs = modelerRef.current;
        const events = ['element.click', 'element.changed'];
        events.forEach((eventType) => {
            bpmnjs.on(eventType, (e) => {
                const { element } = e;
                const { type } = element;
                if (type !== 'label') {
                    setActiveNode(element);
                }
            });
        });
    };

    // 默认当前节点为流程的根节点
    const initActiveNode = () => {
        const canvas = modelerRef.current.get('canvas');
        const rootElement = canvas.getRootElement();
        setActiveNode(rootElement);
    };

    // 初始化导入xml文件
    const renderDiagram = async () => {
        try {
            const result = await modelerRef.current.importXML(XML);
            const { warnings } = result;
            initActiveNode();
        } catch (err) {
            Modal.error({ title: 'XML解析失败' });
            console.log(err.message, err.warnings);
        }
    };

    useEffect(() => {
        modelerRef.current = new CustomModeler({
            container: '#bpmnContainer',
            propertiesPanel: {
                parent: '#properties-panel',
            },
            additionalModules: [
                {
                    zoomScroll: ['value', ''],
                    labelEditingProvider: ['value', ''],
                },
                lintModule, // 校验模块
                minimapModule, // 自定义小地图模块
            ],
            linting: {
                bpmnlint: bpmnlintConfig,
            },
            moddleExtensions: {
                flowable: flowableModdle,
            },
        });
        // 移除官方logo
        const logo = document.querySelector('.bjs-powered-by');
        const bpmnContainer = document.querySelector('.bjs-container');
        if (bpmnContainer && logo) {
            bpmnContainer.removeChild(logo);
        }
        renderDiagram();
        addModelerListener();
    }, []);

    // 更新任务或事件的属性
    const updateBpmn = (value: any) => {
        const modeling = modelerRef.current.get('modeling');
        if (activeNodeEle) {
            modeling.updateProperties(activeNodeEle, value);
        }
    };

    const propertiesProps = {
        modeler: modelerRef.current,
        updateProperties: updateBpmn,
        activeNodeEle,
    };

    const getBpmnXML = () => {
        const bpmnModeler = modelerRef.current;
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

    const saveBpmnXML = async () => {
        const xml = await getBpmnXML();
        console.log(xml, '保存xml');
    };

    useImperativeHandle(childRef, () => {
        return {
            getXML: getBpmnXML,
        };
    });

    return (
        <>
            <div className={styles.editToolContainer}>
                <EditingTools onSave={saveBpmnXML} modeler={modelerRef.current} />
            </div>
            <div className={styles.processContainer}>
                <div className={styles.bpmnContainer} id="bpmnContainer" />
                <aside className={styles.aside}>
                    <div className={styles.panelContainer} id="properties-panel">
                        <CustomProperties {...propertiesProps} />
                    </div>
                </aside>
            </div>
        </>
    );
};

export default forwardRef(ProcessDesign);
