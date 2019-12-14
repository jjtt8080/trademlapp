import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import { Form, Input } from 'antd';

const CustomizedForm = Form.create({
  name: 'global_state',
  onFieldsChange(props, changedFields) {
    props.onChange(changedFields);
  },
  mapPropsToFields(props) {
    console.log("props", props)
    return {
      watch_list_name: Form.createFormField({
        ...props.state.watch_list_name,
        value: props.state.fields.watch_list_name.value,
      }),
    };
  },
  onValuesChange(_, values) {
    console.log(values);
  },
})(props => {
  const { getFieldDecorator } = props.form;
  return (
    <Form layout="inline">
      <Form.Item label="Watch_list_name">
        {getFieldDecorator('watch_list_name', {
          rules: [{ required: true, message: 'watch_list_name is required!' }],
        })(<Input />)}
      </Form.Item>
    </Form>
  );
});
export { CustomizedForm };
          