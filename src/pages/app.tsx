import React from "react";
// 引入路由组件
import RouteComponent from "@/routes/index";

// 路由组件
function MyRoutes() {
    return (
        <React.Suspense fallback={null}>
            <RouteComponent />
        </React.Suspense>
    );
}

// 根组件
const App: React.FC<any> = (props) => {
    return (
        <div className="reveal">
            <MyRoutes />
        </div>
    );
}

export default App;
