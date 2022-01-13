import React from 'react';
import { Tabs } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import renderPanelTitle from './Title';
import RenderPanel from './propertieiesPanel';

const { TabPane } = Tabs;

export interface CustomPropertiesProps {
    modeler: unknown
    activeElement: unknown
    updateProperties: (value: any) => void
}
const CustomProperties = (props: CustomPropertiesProps) => {
    const { activeElement = {} } = props;
    const { type } = activeElement || {};
    return (
        <Tabs type="card">
            <TabPane
                tab={
                    <span>
                        <SettingOutlined />
                        {renderPanelTitle(type)}
                    </span>
                }
            >
                <RenderPanel {...props} />
            </TabPane>
        </Tabs>
    );
};
export default CustomProperties;
