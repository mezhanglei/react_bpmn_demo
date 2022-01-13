import React, { useEffect } from 'react';
import { Input, Form } from 'antd';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { CustomPropertiesProps } from '..';

const layout = {
    labelCol: { span: 7 },
    wrapperCol: { span: 16 },
};
const FormItem = Form.Item;

const Process = (props: CustomPropertiesProps) => {
    const [form] = Form.useForm();
    const { activeElement } = props;
    const nodeValues = getBusinessObject(activeElement);
    useEffect(() => {
        form.setFieldsValue({
            id: nodeValues?.id,
            name: nodeValues?.name,
        });
    }, [form, nodeValues?.id, nodeValues?.name]);

    return (
        <Form {...layout} form={form} key={nodeValues?.id}>
            <FormItem label="流程ID" name="id" rules={[{ required: true }]}>
                <Input disabled />
            </FormItem>
            <FormItem label="流程名称" name="name" rules={[{ required: true }]}>
                <Input disabled />
            </FormItem>
        </Form>
    );
};
export default Process;
