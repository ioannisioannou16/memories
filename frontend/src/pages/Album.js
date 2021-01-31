import { useHistory, useParams } from "react-router";
import { Button, Card, Form, Input, PageHeader, Spin } from "antd";
import UploadFormItem from "../components/UploadFormItem";
import { useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { fetchAlbum } from "../redux/albumDetails";

export default () => {

  const history = useHistory();
  const dispatch = useDispatch();
  const { albumId } = useParams();
  const album = useSelector(state => state.albumDetails.byId[albumId], shallowEqual);
  const isLoading = useSelector(state => state.albumDetails.isLoading);

  useEffect(() => {
    dispatch(fetchAlbum(albumId))
  }, [])

  if (isLoading || !album) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}><Spin size="large" /></div>
  }

  return (
    <Card>
      <PageHeader
        onBack={() => history.goBack()}
        extra={[
          <Button key="1" type="danger">
            Delete
          </Button>,
        ]}
      />
      <div style={{ padding: 16 }}>
        <Form layout="vertical" initialValues={{
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
