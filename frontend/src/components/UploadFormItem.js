import { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { message, Modal, Upload } from "antd";
import axios from "axios";
import { addImage, deleteImage } from "../redux/memories";
import { useDispatch } from "react-redux";
import _ from 'lodash';

const axiosUploadInstance = axios.create();

const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export default ({ value = [], onChange, memoryId }) => {

  const dispatch = useDispatch();
  const [fileList, setFileList] = useState([])
  const [preview, setPreview] = useState({
    visible: false,
    src: null
  })

  useEffect(() => {
    setFileList(value.map(({ imageId, imageUrl }) => ({
      uid: imageId,
      imageId,
      url: imageUrl,
      status: 'done'
    })))
  }, [])

  const handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreview({
      visible: true,
      src: file.url || file.preview,
    });
  };

  const beforeUpload = file => {
    if (!_.startsWith(file.type, 'image/')) {
      message.error('You can only upload images');
      return false;
    }
    if (!(file.size / 1024 / 1024 < 10)) {
      message.error('Image must smaller than 10MB');
      return false;
    }
    return true;
  }

  const handleChange = (info) => {
    const files = info.fileList
      .filter(file => !!file.status)
      .map(file => ({
        uid: file.uid,
        imageId: _.get(file, 'response.imageId', file.imageId),
        url: _.get(file, 'response.imageUrl', file.url),
        status: file.status
      }))
    setFileList(files)
    onChange(files.filter(file => file.status === 'done').map(file => ({ imageId: file.imageId, imageUrl: file.url })))
  }

  const handleCancel = () => setPreview({ visible: false, src: null })

  const onRemove = async (file) => {
    const imageId = file.imageId
    if (imageId) {
      await axios.delete(`/memories/${memoryId}/images/${imageId}`)
      dispatch(deleteImage({ memoryId, imageId }))
    }
  }

  const customRequest = async ({
    file,
    onError,
    onProgress,
    onSuccess,
  }) => {
    try {
      const { imageId, imageUrl, imageUploadData } = (await axios.post(`/memories/${memoryId}/generate-upload-url`)).data
      const formData = new FormData();
      formData.append("Content-Type", file.type);
      Object.entries(imageUploadData.fields).forEach(([k, v]) => formData.append(k, v));
      formData.append("file", file)
      await axiosUploadInstance
        .post(imageUploadData.url, formData, {
          onUploadProgress: ({ total, loaded }) => {
            onProgress({ percent: Math.round((loaded / total) * 100).toFixed(2) }, file);
          },
        })
      dispatch(addImage({ memoryId, image: { imageId, imageUrl }}))
      onSuccess({ imageId, imageUrl }, file);
    } catch (err) {
      onError(err);
    }
  }

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );
  return (
    <>
      <Upload
        beforeUpload={beforeUpload}
        customRequest={customRequest}
        multiple={true}
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        onRemove={onRemove}
      >
        {fileList.length >= 10 ? null : uploadButton}
      </Upload>
      <Modal
        visible={preview.visible}
        title="Photo Viewer"
        footer={null}
        onCancel={handleCancel}
      >
        <img style={{ width: '100%' }} src={preview.src} />
      </Modal>
    </>
  );
}
