import React from 'react';
import { CustomPropertiesProps } from '..';
import Events from './Event';
import Process from './Process';
import SequenceFlow from './SequenceFlow';
import Task from './Task';

const RenderPanel = (props: CustomPropertiesProps) => {
    const { activeNodeEle = {} } = props;
    const { type } = activeNodeEle || {};
    const panels = {
        'bpmn:Process': <Process {...props} />, // 流程根节点属性面板
        'bpmn:StartEvent': <Events {...props} />, // 开始事件属性面板
        'bpmn:EndEvent': <Events {...props} />, // 结束事件属性面板
        'bpmn:SequenceFlow': <SequenceFlow {...props} />, // 条件属性面板
        'bpmn:ExclusiveGateway': <Events {...props} />, // 网关属性面板
        'bpmn:UserTask': <Task {...props} />, // 任务节点属性面板
    };
    const panelComponent = panels[type] || <Process {...props} />;
    return <div>{panelComponent}</div>;
};
export default RenderPanel;
