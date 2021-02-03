import { Button, Card, Carousel, Col, Image, List, Row, Spin, Typography, message, Popconfirm, Empty } from "antd";
import { useHistory } from "react-router";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { createMemory, deleteMemory, fetchMemories } from "../redux/memories";
import { EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { unwrapResult } from "@reduxjs/toolkit";
import _ from 'lodash';
import { sendNotification } from "../redux/system";

const { Title } = Typography;
const { Meta } = Card;

export default () => {

  const dispatch = useDispatch();
  const history = useHistory();
  const { all, byId, isLoadingAll, isCreating } = useSelector(state => state.memories, shallowEqual);
  const allMemories = all.map(id => byId[id]);

  useEffect(() => {
    if (!allMemories.length) {
      dispatch(fetchMemories())
    }
  }, [])

  const onNewMemory = () => {
    const hide = message.loading('Creating new memory..');
    dispatch(createMemory())
      .then(unwrapResult)
      .then((data) => history.push({
        pathname: `/memories/${data.memoryId}`,
        state: { new: true }
      }))
      .catch(_.noop)
      .finally(hide)
  }

  const onDelete = (memoryId) => {
    const hide = message.loading('Deleting memory..');
    dispatch(deleteMemory(memoryId))
      .then(unwrapResult)
      .then(() => history.push('/'))
      .catch(_.noop)
      .finally(hide);
  }

  const renderItem = (item) => {
    const { memoryId, title = "Untitled", description, images = [], isDeleting = false } = item;
    return <div key={memoryId} style={{ marginBottom: 24 }}>
      <Card
        cover={
          <Carousel autoplay>
            {images.map(image => (
              <Image
                height="250px"
                width="100%"
                key={image.imageId}
                src={image.imageUrl}
                preview={false}
                placeholder={<Spin style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }} />}
              />
            ))}
          </Carousel>
        }
        actions={[
          <EyeOutlined onClick={() => history.push(`/memories/${memoryId}/view`)} key="view" />,
          <EditOutlined onClick={() => history.push(`/memories/${memoryId}`)} key="edit" />,
          <Popconfirm
            title="Are you sure to delete this memory?"
            key="delete"
            onConfirm={() => onDelete(memoryId)}
            disabled={isDeleting}
          >
            <DeleteOutlined disabled={isDeleting} />
          </Popconfirm>,
        ]}
      >
        <Meta
          title={title}
          description={description}
        />
      </Card>
    </div>
  }

  return <div>
    <Row>
      <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 18, offset: 3 }} lg={{ span: 14, offset: 5 }} xl={{ span: 12, offset: 6 }} xxl={{ span: 10, offset: 7 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title style={{ margin: 0 }}>My Memories</Title>
          <Button type="primary" onClick={onNewMemory} disabled={isCreating}>New</Button>
        </div>
        {(!isLoadingAll && !allMemories.length)
          ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh'  }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<span>No memories</span>}
              >
                <Button type="primary" onClick={onNewMemory}>Create New</Button>
              </Empty>
            </div>
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={allMemories}
              loading={isLoadingAll}
              renderItem={renderItem}
            />
          )
        }
      </Col>
    </Row>

  </div>
}
