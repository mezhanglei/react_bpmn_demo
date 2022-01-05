import React, { useState, useRef } from 'react';
import { Tabs } from 'antd';
import { defaultDiagramXML } from './resource/defaultDiagram';
import ProcessDesign from './ProcessDesign';
import XMLView from './XMLView';

const { TabPane } = Tabs;

const BpmnProcess = () => {
    const [bpmnXML, setXML] = useState(defaultDiagramXML);
    const childRef = useRef<ProcessDesign>(null);

    const tabsChange = async (key: string) => {
        if (key !== '2') {
            return false;
        }
        const { current } = childRef;
        console.log(current)
        if (current) {
            const xml = await current.getBpmnXML();
            setXML(xml);
        }
    };

    return (
        <Tabs onChange={(avtiveKey) => tabsChange(avtiveKey)} defaultActiveKey="1">
            <TabPane key="1" tab="流程设计">
                <ProcessDesign ref={childRef} XML={bpmnXML} />
            </TabPane>
            <TabPane key="2" tab="XML">
                <XMLView XML={bpmnXML} />
            </TabPane>
        </Tabs>
    );
};
export default BpmnProcess;
