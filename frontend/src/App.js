import { Layout } from 'antd';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import About from "./pages/About";
import Main from "./pages/Main";
import MainHeader from "./components/MainHeader";
import RequireAuth from "./components/RequireAuth";
import { Provider } from 'react-redux';
import store from "./redux/store";
import initialiseAPI from "./utils/initialiseAPI";
import LoginCallback from "./pages/LoginCallback";
import LogoutCallback from "./pages/LogoutCallback";
import CreateOrEditMemory from "./pages/CreateOrEditMemory";
import ViewMemory from './pages/ViewMemory';
import Notification from "./components/Notification";

initialiseAPI(store);

const { Header, Content, Footer } = Layout;

export default () => {
  return (
    <Provider store={store}>
      <Router>
        <Layout id="mainLayout">
          <Notification />
          <Header id="mainHeader">
            <MainHeader />
          </Header>
          <Content id="mainPageContent">
            <Switch>
              <Route exact path="/about">
                <About/>
              </Route>
              <Route exact path="/callback">
                <LoginCallback/>
              </Route>
              <Route exact path="/logout">
                <LogoutCallback/>
              </Route>
              <RequireAuth path="/">
                <Switch>
                  <Route exact path="/">
                    <Main/>
                  </Route>
                  <Route exact path="/memories/:memoryId/view">
                    <ViewMemory/>
                  </Route>
                  <Route exact path="/memories/:memoryId">
                    <CreateOrEditMemory/>
                  </Route>
                </Switch>
              </RequireAuth>
            </Switch>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Memories ©2021</Footer>
        </Layout>
      </Router>
    </Provider>
  );
}
