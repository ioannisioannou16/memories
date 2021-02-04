import { useHistory, useParams } from "react-router";
import { Button, Card, Form, Input, message, PageHeader, Popconfirm, Spin } from "antd";
import UploadFormItem from "../components/UploadFormItem";
import { useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import _ from 'lodash';
import { deleteMemory, fetchMemory, updateMemory } from "../redux/memories";

const { TextArea } = Input;

export default () => {

  const history = useHistory();
  const dispatch = useDispatch();
  const { memoryId } = useParams();
  const memory = useSelector(state => state.memories.byId[memoryId], shallowEqual);
  const [form] = Form.useForm();

  const onDelete = () => {
    const hide = message.loading('Deleting memory..');
    dispatch(deleteMemory(memoryId))
      .then(unwrapResult)
      .then(() => history.push('/'))
      .catch(_.noop)
      .finally(hide);
  }

  const onUpdate = ({ title, description }) => {
    const hide = message.loading('Updating memory..');
    dispatch(updateMemory({ memoryId, title, description }))
      .then(unwrapResult)
      .then(() => history.push('/'))
      .catch(_.noop)
      .finally(hide);
  }

  const onBack = async () => {
    const values = form.getFieldsValue();
    if (!values.title && !values.description && !values.images.length) {
      return onDelete();
    } else if (values.title !== memory.title || values.description !== memory.description) {
      return onUpdate(values)
    } else {
      return history.push('/')
    }
  }

  useEffect(() => {
    if (!memory) {
      dispatch(fetchMemory(memoryId))
    }
  }, [memory])

  if (!memory) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}><Spin size="large" /></div>
  }

  return (
    <Card>
      <PageHeader
        onBack={onBack}
        extra={[
          <Popconfirm
            title="Are you sure to delete this memory?"
            key="delete"
            onConfirm={onDelete}
            disabled={!!memory.isDeleting || !!memory.isUpdating}
          >
            <Button type="danger" disabled={!!memory.isDeleting || !!memory.isUpdating}>
              Delete
            </Button>
          </Popconfirm>
        ]}
      />
      <div style={{ padding: 16 }}>
        <Form form={form} layout="vertical" initialValues={memory}>
          <Form.Item
            label="Title"
            name="title"
          >
            <Input placeholder="Untitled" />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            label="Images"
            name="images"
          >
            <UploadFormItem memoryId={memoryId} />
          </Form.Item>
        </Form>
      </div>
    </Card>
  )
}
