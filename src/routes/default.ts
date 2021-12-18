import loadable from "@/components/lazy";
const NotFound = loadable({ loader: () => import(/* webpackChunkName: "default" */ '@/components/default/not-found') });

// 默认的部分
export const DefaultRoutes = [
    // 404页面路由
    {
        path: "/not-found",
        component: NotFound
    }
];
