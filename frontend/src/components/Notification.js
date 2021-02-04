import React, { useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { sendNotification } from '../redux/system';
import { message } from "antd";

export default () => {
  const dispatch = useDispatch();
  const notificationObj = useSelector((state) => state.system.notification, shallowEqual);
  useEffect(() => {
    if (notificationObj) {
      const { type, content } = notificationObj;
      message[type](content);
      dispatch(sendNotification(null));
    }
  }, [notificationObj, dispatch]);
  return <></>;
}
