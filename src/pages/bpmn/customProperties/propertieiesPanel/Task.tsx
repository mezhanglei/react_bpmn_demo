import React, { useEffect, useState } from 'react';
import { Input, Form, Select } from 'antd';
import elementHelper from 'bpmn-js-properties-panel/lib/helper/ElementHelper';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { CustomPropertiesProps } from '..';

const typeOptions = [
    { label: '角色', value: 'role' },
    { label: '固定人员', value: 'user' },
];

const list = ['userType', 'candidateUserList', 'candidateRoleList'];

const layout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 16 },
};
const FormItem = Form.Item;

const Tasks = (props: CustomPropertiesProps) => {
    const [form] = Form.useForm();
    const [userType, setUserType] = useState('');
    const userOptions = [];
    const roleOptions = [];
    const { activeNodeEle, updateProperties, modeler } = props;
    const nodeValues = getBusinessObject(activeNodeEle);
    const { extensionElements: extensionEle } = nodeValues;

    const getSelectType = (role, user) => {
        if (role && role.length > 0) {
            return 'role';
        }
        if (user && user.length > 0) {
            return 'user';
        }
        return '';
    };

    // 获取指定拓展属性值
    const getExtensionProperty = (type: string) => {
        if (!extensionEle) {
            return [];
        }
        const extEl = extensionEle?.values[0];
        const elelist = extEl[type];
        if (!elelist) return [];
        if (Array.isArray(elelist)) {
            return elelist;
        }
        return elelist.split(',');
    };

    useEffect(() => {
        const candidateRoleList = getExtensionProperty('candidateRoleList');
        const candidateUserList = getExtensionProperty('candidateUserList');
        const type = getSelectType(candidateRoleList, candidateUserList);
        setUserType(type);
        form.setFieldsValue({
            id: nodeValues?.id,
            name: nodeValues?.name,
            userType: type,
            candidateRoleList,
            candidateUserList,
        });
    }, [extensionEle, form, nodeValues?.id, nodeValues?.name]);

    // 更新自定义属性
    const updateCustomeProperites = (property: string, value: any) => {

        // extensionElements拓展节点
        const bpmnFactory = modeler.get('bpmnFactory');
        let extensionElements = nodeValues.get('extensionElements');
        if (!extensionElements) {
            extensionElements = elementHelper.createElement(
                'bpmn:ExtensionElements',
                null,
                activeNodeEle,
                bpmnFactory,
            );
        }

        // flowable:CustomProperties节点信息
        const eleValues = extensionElements.get('values');
        let customProperties;
        let customPropertiesIndex = -1;
        for (let i = 0; i < eleValues?.length; i += 1) {
            if (eleValues[i] && eleValues[i].$type === 'flowable:CustomProperties') {
                customProperties = eleValues[i];
                customPropertiesIndex = i;
            }
        }
        if (!customProperties) {
            customProperties = elementHelper.createElement(
                'flowable:CustomProperties',
                null,
                activeNodeEle,
                bpmnFactory,
            );
        }

        // flowable:CustomProperties节点赋值
        customProperties[property] = Array.isArray(value) ? value.join(',') : value;
        // extensionElementsj节点赋值
        if (customPropertiesIndex > -1) {
            eleValues[customPropertiesIndex] = customProperties;
        } else {
            eleValues.push(customProperties);
        }
        // 更新xml拓展信息
        updateProperties({ extensionElements });
    };

    const valueChange = (value: any) => {
        const keys = Object.keys(value);
        // 更新拓展属性
        if (keys.some((item) => list.includes(item))) {
            if (userType === 'role') {
                updateCustomeProperites('candidateRoleList', value.candidateRoleList);
            } else if (userType === 'user') {
                updateCustomeProperites('candidateUserList', value.candidateUserList);
            }
        } else {
            // 更新其他属性
            updateProperties(value);
        }
    };

    return (
        <Form
            {...layout}
            form={form}
            key={nodeValues?.id}
            onValuesChange={(changedValues) => valueChange(changedValues)}
        >
            <FormItem label="ID" name="id" rules={[{ required: true }]}>
                <Input disabled />
            </FormItem>
            <FormItem label="名称" name="name" rules={[{ required: true }]}>
                <Input />
            </FormItem>
            <FormItem name="userType" label="人员" rules={[{ required: true }]}>
                <Select onChange={(value) => setUserType(value)} options={typeOptions} />
            </FormItem>
            {userType === 'role' ? (
                <FormItem name="candidateRoleList" label="选择" rules={[{ required: true }]}>
                    <Select mode="multiple" options={roleOptions} />
                </FormItem>
            ) : (
                ''
            )}
            {userType === 'user' ? (
                <FormItem name="candidateUserList" label="选择" rules={[{ required: true }]}>
                    <Select mode="multiple" options={userOptions} />
                </FormItem>
            ) : (
                ''
            )}
        </Form>
    );
};
export default Tasks;
