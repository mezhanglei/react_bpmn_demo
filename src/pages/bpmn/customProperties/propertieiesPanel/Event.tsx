import React, { useEffect } from 'react';
import { Input, Form } from 'antd';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { CustomPropertiesProps } from '..';

const layout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 16 },
};
const FormItem = Form.Item;

const Events = (props: CustomPropertiesProps) => {
    const [form] = Form.useForm();
    const { activeElement, updateProperties } = props;
    const nodeValues = getBusinessObject(activeElement);
    useEffect(() => {
        form.setFieldsValue({
            id: nodeValues?.id,
            name: nodeValues?.name,
        });
    }, [form, nodeValues?.id, nodeValues?.name]);

    const valueChange = (value: string) => {
        updateProperties(value);
    };

    return (
        <Form
            {...layout}
            form={form}
            key={nodeValues?.id}
            onValuesChange={(changedValues) => valueChange(changedValues)}
        >
            <FormItem label="节点ID" name="id" rules={[{ required: true }]}>
                <Input disabled />
            </FormItem>
            <FormItem label="节点名称" name="name" rules={[{ required: true }]}>
                <Input />
            </FormItem>
        </Form>
    );
};
export default Events;
