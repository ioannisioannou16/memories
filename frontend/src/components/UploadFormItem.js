import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { message, Modal, Upload } from "antd";
import api from "../api";
import axios from "axios";

const axiosUploadInstance = axios.create();

const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export default ({ value = [], onChange, albumId }) => {

  console.log(value)

  const [preview, setPreview] = useState({
    visible: false,
    src: null
  })

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
    if ((file.type !== 'image/png') && (file.type !== "image/jpeg")) {
      message.error('You can only upload png or jpeg photos');
      return false;
    }
    if (!(file.size / 1024 / 1024 < 10)) {
      message.error('Image must smaller than 10MB');
      return false;
    }
    return true;
  }

  const handleChange = (info) => {
    onChange(info.fileList.filter(file => !!file.status))
  }

  const handleCancel = () => setPreview({ visible: false, src: null })

  const customRequest = async ({
    file,
    onError,
    onProgress,
    onSuccess,
  }) => {
    try {
      const uploadUrl = await api.generateUploadUrl({ albumId, fileType: file.type });
      const response = await axiosUploadInstance
        .put(uploadUrl, file, {
          headers: {
            'Content-Type': file.type
          },
          onUploadProgress: ({ total, loaded }) => {
            onProgress({ percent: Math.round((loaded / total) * 100).toFixed(2) }, file);
          },
        })
      onSuccess(response, file);
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
        fileList={value}
        onPreview={handlePreview}
        onChange={handleChange}
      >
        {uploadButton}
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
