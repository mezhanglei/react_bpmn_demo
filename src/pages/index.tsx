import React from "react";
import ReactDOM from "react-dom";
import App from "./app";
import { ConfigProvider } from 'antd';
import antdConfigs from "./antd-configs";
// 引入全局样式
import "less/index.less";


ReactDOM.render(
    <ConfigProvider {...antdConfigs} >
        <App />
    </ConfigProvider>,
    document.getElementById("root")
);
