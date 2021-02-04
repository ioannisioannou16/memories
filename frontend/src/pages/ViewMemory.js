import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import { useEffect } from "react";
import { fetchMemory } from "../redux/memories";
import { Button, Card, Col, Image, PageHeader, Popconfirm, Row, Spin, Typography } from "antd";

const { Title, Text } = Typography;

export default () => {
  const { memoryId } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const memory = useSelector(state => state.memories.byId[memoryId], shallowEqual);

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
        onBack={() => history.push('/')}
        extra={[
          <Button key="edit" type="primary" onClick={() => history.push(`/memories/${memoryId}`)}>
            Edit
          </Button>
        ]}
      />
      <div style={{ padding: 16 }}>
        <Title>{memory.title}</Title>
        <Text>{memory.description}</Text>
        <div style={{ marginTop: 24 }}>
          <Image.PreviewGroup>
            <Row gutter={[16, 16]}>
              {memory.images.map(({ imageId, imageUrl}) => (
                <Col xs={24} sm={12} md={6}>
                  <Image
                    width="100%"
                    height={200}
                    key={imageId}
                    src={imageUrl}
                  />
                </Col>
              ))}
            </Row>
          </Image.PreviewGroup>
        </div>
      </div>
    </Card>
  );
}
