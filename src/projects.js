// All placeholder copy and media live here. Replace these objects with real project content.
// Media accepts { type: 'image' | 'video', src, poster, alt } from /public or a URL.
export const featuredProjects = [
  {
    id: 'video-agent', name: '视频生成 Agent', label: 'VIDEO GENERATION AGENT',
    title: ['From a thought.', 'To a finished film.'],
    description: '从一个想法开始，让创作逐帧发生。这里将展示视频生成 Agent 的核心能力、创作过程，以及最终的视频作品。',
    caption: '视频生成 Agent · 案例一',
    facts: [['起点', 'Idea', '从想法与脚本开始'], ['过程', 'Create', '编排画面、声音与节奏'], ['结果', 'Film', '让创意成为完整作品']],
    tags: ['Video generation', 'Agent workflow', 'Creative tools'],
    meta: [['类别', '视频生成'], ['角色', '独立项目'], ['内容', '案例待补充'], ['形式', '创作工具']],
    detail: '这里预留项目背景、核心功能、创作流程和成片展示。当前文案用于确认排版，待内容确定后替换。', media: null,
  },
  {
    id: 'video-workflow', name: '视频生成 Agent', label: 'VIDEO CREATION WORKFLOW',
    title: ['One workflow.', 'Every frame.'],
    description: '把创作中的每个环节连接起来。这里将展示第二个视频案例，从素材组织到成片输出，呈现完整的创作路径。',
    caption: '视频生成 Agent · 案例二',
    facts: [['输入', 'Source', '整理创作需要的素材'], ['编排', 'Compose', '组织每一个创作环节'], ['交付', 'Deliver', '呈现最终的视频作品']],
    tags: ['Content creation', 'Workflow', 'Video production'],
    meta: [['类别', '视频创作'], ['角色', '独立项目'], ['内容', '案例待补充'], ['形式', '工作流']],
    detail: '这里预留第二个视频项目的介绍、流程和演示视频。案例名称、文字和媒体可以独立替换，不影响翻页结构。', media: null,
  },
];

export const otherProjects = [
  {
    id: 'naval', name: '纳瓦尔认知库', subtitle: 'Read. Reflect. Understand.',
    description: '把纳瓦尔的思想带在身边。阅读双语原文，借助图解与音频理解，再用手机上的本地问答梳理问题、查看相关原文。',
    tags: ['Android 应用', '离线阅读与问答'], presentation: 'phone', platform: 'Android · 本地运行',
    media: { type: 'video', inline: true, src: '/media/naval/demo.mp4', poster: '/media/naval/poster.webp', showcaseSrc: '/media/naval/user-timeline.mp4', showcasePoster: '/media/naval/timeline-poster.webp', posterAlt: '纳瓦尔认知库：首页人物、今日思想与阅读入口', alt: '纳瓦尔认知库：双语阅读、本地问答与相关原文的真机操作演示' },
  },
  {
    id: 'news', name: '个人信源', subtitle: 'Your sources. Your perspective.',
    description: '把 AI 内容、开源项目、新产品与社区讨论放进一个入口。按兴趣筛选，回到原文核验，让每天的信息浏览更有方向。',
    tags: ['Web 应用', '信息筛选'],
    url: 'https://nauyz.github.io/personal-signal-desk/',
    media: { type: 'video', inline: true, src: '/media/personal-signal/user-demo.mp4', poster: '/media/personal-signal/user-poster.webp', alt: '个人信源：精选内容、智能体筛选、原文入口与 GitHub 热门项目演示' },
  },
];
