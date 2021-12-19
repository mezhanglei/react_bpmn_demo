import loadable from "@/components/lazy";

export const Demo1 = loadable({ loader: () => import(/* webpackChunkName: "demo1" */ '@/pages/bpmn/index') });
// 首页
export const DemoRoute = [
    {
        path: "/",
        component: Demo1,
        exact: true
    },
    {
        path: "/bpmn",
        component: Demo1,
        // 自定义字段，额外的组件信息
        meta: {
            title: "bpmn",
        }
    }
];
