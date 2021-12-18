import React, { ReactNode } from "react";
import { HashRouter as Router, Route, Switch, Prompt, Redirect, RouteProps } from "react-router-dom";
// import { BrowserRouter as Router, Route, Switch, Prompt, Redirect } from "react-router-dom";
import { DemoRoute } from "./demo";
import { DefaultRoutes } from "./default";

export interface MyRouteProps extends RouteProps {
    auth?: boolean; // 是否需要权限验证
    component: any; // 组件
}

// 路由配置
const routes = [
    ...DemoRoute,
    ...DefaultRoutes,
    // {
    //     path: '*',
    //     component: NotFound,
    //     auth: true
    // }
];

// 路由组件
export default function RouteComponent() {
    // BrowserRouter时需要设置basename
    const basename = Router.name == "BrowserRouter" ? process.env.PUBLIC_PATH : "";

    return (
        <Router basename={basename}>
            <Switch>
                {routes.map((item: MyRouteProps, index) => {
                    return <Route
                        key={index}
                        exact={item.exact}
                        path={item.path}
                        render={(props) => {
                            return (
                                <React.Fragment>
                                    <item.component key={item.path} {...props}></item.component>
                                </React.Fragment>
                            );
                        }}
                    />;
                })}
            </Switch>
        </Router>
    );
}
