import { useHistory, useParams } from "react-router";
import { Button, Card, Form, Input, PageHeader, Spin, Popconfirm, useForm } from "antd";
import UploadFormItem from "../components/UploadFormItem";
import { useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { fetchAlbum } from "../redux/albumDetails";
import { deleteAlbum } from "../redux/album";
import { unwrapResult } from "@reduxjs/toolkit";
import _ from 'lodash';

export default () => {

  const history = useHistory();
  const dispatch = useDispatch();
  const { albumId } = useParams();
  const album = useSelector(state => state.albumDetails.byId[albumId], shallowEqual);
  const isLoading = useSelector(state => state.albumDetails.isLoading);
  const [form] = Form.useForm();

  const onDelete = () => {
    dispatch(deleteAlbum(albumId))
      .then(unwrapResult)
      .then(() => history.push('/'))
      .catch(_.noop)
  }

  const onBack = () => {
    const values = form.getFieldsValue();
    if (!values.title && !values.photos.length) {
      return onDelete();
    }
    history.push('/')
  }

  useEffect(() => {
    dispatch(fetchAlbum(albumId))
  }, [])

  if (isLoading || !album) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}><Spin size="large" /></div>
  }

  return (
    <Card>
      <PageHeader
        onBack={onBack}
        extra={[
          <Popconfirm
            title="Are you sure to delete this album?"
            onConfirm={onDelete}
          >
            <Button key="1" type="danger">
              Delete
            </Button>
          </Popconfirm>
        ]}
      />
      <div style={{ padding: 16 }}>
        <Form form={form} layout="vertical" initialValues={{
          ...album,
          photos: album.photos.map(url => ({
            url,
            status: 'done'
          }))
        }}>
          <Form.Item
            label="Title"
            name="title"
          >
            <Input placeholder="Untitled" />
          </Form.Item>
          <Form.Item
            label="Photos"
            name="photos"
          >
            <UploadFormItem albumId={albumId} />
          </Form.Item>
        </Form>
      </div>
    </Card>
  )
}
