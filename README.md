
### 目录说明和相应规范
```
    |-- .babelrc //babel配置文件
    |-- .eslintrc.js //eslint规则配置
    |-- .gitignore  // git提交忽略
    |-- .prettier.config.js //prettier插件配置信息
    |-- .stylelintrc.js // stylelint插件配置信息
    |-- package.json
    |-- postcss.config.js // postcss配置信息
    |-- tsconfig.json // ts配置
    |-- less         // 全局的基础css配置文件夹, 全局样式写在这里
    |   |-- base   // 基础原子标签样式和公共基础类
    |   |-- components // ui组件库的自定义样式(自定义组件和开源ui组件)
    |   |-- constants // 公共的less常量
    |   |-- pages  // 页面业务相关的公共类
    |       |-- index.less
    |-- public // html模板
    |-- src
    |   |-- components // 全局要使用的组件必须要放在这里
    |   |-- pages // 单页面代码所在文件夹
    |   |   |-- index.js // 入口js文件
    |   |-- routes // 路由所在文件夹
    |-- static     // 打包时要拷贝的静态资源, 需要在webpack/configs文件中配置引用路径后才能生效
    |-- webpack   // webpack配置文件夹
        |-- configs.js  // 自定义配置
        |-- webpack.dev.js // 开发环境
        |-- webpack.prod.js // 生产环境
```
