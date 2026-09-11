# 网站统计口径

统计后台：Umami Cloud，站点 ID 配置在 GitHub Actions 仓库变量中。

| 事件 | 含义 |
| --- | --- |
| 页面访问（无事件名） | 每次加载页面一次，锚点跳转不新增访问 |
| experience_open | 展开完整经历 |
| resume_download | 点击下载简历，不保证下载完成 |
| project_visit | 点击项目网站链接 |
| video_play | 视频首次实际播放，包括自动播放；每个视频元素每次页面加载一次 |
| scroll_depth | 到达可滚动距离的 25/50/75/95%，每档一次；95% 表示接近底部 |
| section_view | about/studio/naval/news 模块进入视野，每模块一次 |
| studio_face_view | 工作台 demo/architecture 面进入视野，每面一次 |
| engagement_time | foreground_seconds 前台秒数；active_seconds 有效停留秒数 |
| section_time | section 对应模块的有效可见秒数 seconds |
| video_watch_time | project 对应视频实际前台可见播放秒数 seconds |
| video_watch_milestone | 累计观看达到 10/30/60/120 秒，每档一次 |
| company_select | 点击切换到另一家公司经历 |
| contact_click | 电话或邮件链接点击，仅记录方式，不记录号码和邮箱 |
| navigation_click | 站内锚点点击 |
| media_control | 主动点击 play/pause/replay，不保证播放成功 |
| studio_flip_click | 点击前后翻面按钮 |
| video_error | 浏览器媒体错误码；可能随后自动恢复，不上传视频 URL |

时长事件每 30 秒及页面隐藏/离开时发送增量，对秒数字段求和得到累计时长，不能把事件次数当秒数。关闭浏览器或网络中断可能丢失最后一段；隐藏时发送也不保证送达。

页面切到后台不计时。连续 60 秒无点击、键盘或滚动且没有可见视频播放时，暂停有效停留计时；前台时间仍记录。有效停留只是近似值，不能证明人在阅读。模块露出高度达到其自身高度与视口高度较小者的 30% 才算可见；同屏多个模块分别计时，因此模块时间之和可能超过页面时长。

视频时长排除后台、隐藏背面、暂停和进度跳跃，缓冲时不累计。循环重复观看可累计，不能据此认定完整看过每一帧。架构面为 iframe 动画，只记录该面曝光、模块停留和控制点击，不冒充视频观看时长。

阅读深度按当时页面高度计算，展开经历会改变页面高度；建议结合模块曝光分析。未采集鼠标轨迹、屏幕录制、输入内容或完整点击流。

同浏览器使用随机本地匿名 ID 关联回访，清除数据或换浏览器可能成为新访客。来源、设备等由 Umami 提供；URL 查询参数已排除，不采集 UTM。DNT、本地预览、video_debug 页面不统计。

排除自己的浏览器：打开 https://nauyz.github.io/?analytics=off 一次；恢复用 ?analytics=on。每个浏览器分别设置。

网络不可达、广告拦截或额度限制可能导致漏报，不影响网站交互。新增事件与属性会增加额度消耗；按档位和 30 秒增量发送，不逐像素或逐帧上报。
