import React, { useState, useEffect, useRef } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Tabs } from 'antd';
import { defaultDiagramXML } from './resource/defaultDiagram';
import ProcessDesign from './ProcessDesign';
import XMLView from './XMLView';

const { TabPane } = Tabs;

const BpmnProcess = () => {
    const [bpmnXML, setXML] = useState(defaultDiagramXML);
    const childRef = useRef(null);

    const tabsChange = async (key) => {
        if (key !== '2') {
            return false;
        }
        const { current } = childRef;
        if (current) {
            const xml = await current.getXML();
            setXML(xml);
        }
    };

    return (
        <PageContainer>
            <Tabs onChange={(avtiveKey) => tabsChange(avtiveKey)} defaultActiveKey="1">
                <TabPane key="1" tab="流程设计">
                    <ProcessDesign childRef={childRef} XML={bpmnXML} />
                </TabPane>
                <TabPane key="2" tab="XML">
                    <XMLView XML={bpmnXML} />
                </TabPane>
            </Tabs>
        </PageContainer>
    );
};
export default BpmnProcess;
