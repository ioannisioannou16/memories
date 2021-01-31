import { Button } from "antd";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { createAlbum } from "../redux/album";
import { unwrapResult } from "@reduxjs/toolkit";
import _ from 'lodash';

export default () => {

  const dispatch = useDispatch();
  const history = useHistory();
  const isLoading = useSelector(state => state.album.isLoading);

  const onNewAlbum = () => {
    dispatch(createAlbum())
      .then(unwrapResult)
      .then((data) => history.push({
        pathname: `/album/${data.albumId}`,
        state: { new: true }
      }))
      .catch(_.noop)
  }

  return <div>
    <Button type="primary" onClick={onNewAlbum} disabled={isLoading}>New Album</Button>
  </div>
}
