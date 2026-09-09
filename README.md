# 个人作品网站

两个可复用展示模块：视频生成 Agent 的双案例滚动翻页卡，以及纳瓦尔 APP / 个人新闻网站的双列展示卡。

## 粒子文字演示

开发服务器启动后打开 `/demo-particle-flow.html`。移动鼠标或用手指划过文字，粒子会形成卷曲薄纱，停止操作后逐渐归位。按 `H` 显示参数面板，按 `Escape` 恢复文字并隐藏面板。支持系统的减少动态效果设置。

实现位于 `src/particle-flow.js`，使用原生 WebGL 绘制、连续流场和弹簧回位，不需要额外运行时依赖。`src/particle-wake.js` 保存并输运鼠标留下的速度场，鼠标停下后仍会延续扩散。粒子分为主体薄纱与少量散尘，具有不同惯性、作用距离和回位时间，避免堆积成同一圆周。文字在 `resize()` 的三行数组中修改。生产构建包含此演示入口。最初演示备份在 `qa/particle-flow-before.html`；上版交互代码在 `qa/particle-flow-v1.js`。

参考对照：`python qa/extract-pointer.py` 从录屏提取绿色鼠标轨迹；`node qa/replay-reference.mjs` 在浏览器重放轨迹并输出关键帧和回位数据。录屏只能用于视觉近似，不能证明与原站源码一致。

交互验证：`node verify-particles.mjs`，可用 `PREVIEW_URL` 指向演示完整地址；结果与截图保存在 `qa/particle-*`。

## 运行

```sh
npm install
npm run dev -- --port 5173
npm run build
```

打开 http://127.0.0.1:5173 。构建产物在 `dist/`，可部署到静态网站托管平台。

## 内容替换

所有项目内容在 `src/projects.js`。`featuredProjects` 为两个视频案例，`otherProjects` 为另两个项目。当前文字是排版样稿，不代表已确认的功能或性能。

项目 `media` 留空时显示占位。将媒体文件放入 `public/` 并填写：

```js
media: { type: 'image', src: '/naval-screen.png', alt: '纳瓦尔 APP 阅读界面' }
// 或
media: { type: 'video', src: '/demo.mp4', poster: '/poster.jpg', alt: '视频生成案例演示' }
```

页面主体为 `src/main.jsx`，配色、字体、间距及响应式规则为 `src/styles.css`。默认深色，可切换浅色。字体通过本地依赖打包，不依赖外部字体服务。

## 交互与验证

滚动将双面项目卡沿 Y 轴从 0° 连续旋转至 -180°，采用 1600px 透视；90° 处经过侧边，背面呈现下一案例，反向滚动可原路回转。旋转直接绑定滚动进度，不使用淡出切换或悬停倾斜。支持前后按钮与聚焦卡片后使用左右方向键。点击案例或项目打开详情，Escape 关闭并恢复焦点。手机端显示单列项目卡，减少动态效果设置会关闭旋转。

启动本地服务器后运行 `node verify.mjs`。脚本自动查找 Windows Chrome / Edge，也支持 `CHROME_PATH` 指定浏览器、`PREVIEW_URL` 指定测试地址。浏览器截图与结果保存在 `qa/`。

参考布局：https://harisahmed.dev/ 和用户提供的 https://priyanshupaul.vercel.app/ 截图。设计借鉴结构与交互，未复制作者身份、项目文案或产品截图。既有粒子演示文件保留独立。

## 线上部署

正式地址：https://nauyz.github.io/

通过 GitHub Pages 免费托管。`.github/workflows/deploy-pages.yml` 会在 `master` 推送后自动安装依赖、构建并发布 `dist/`。功能分支可继续开发，合入 `master` 并推送后才更新线上网站。

```sh
git push origin master
```

部署状态可在 GitHub 仓库的 Actions 页面查看。视频、图片、字体与简历随静态站点一起发布，不依赖本地服务。