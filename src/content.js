export const profile = {
  name: 'Lizhe Chen',
  nameZh: '陈立哲',
  title: 'Graphics & Vision-Language Models · M.S. Student',
  titleZh: '图形学 & 视觉语言模型 · 硕士研究生',
  affiliation: 'M.S. Student · Interactive Media Technology · Tsinghua University',
  affiliationZh: '硕士研究生 · 互动媒体技术 · 清华大学',
  thesis:
    'Hi, welcome to my site. I am a master student at Tsinghua University. My research centers on computer graphics (real-time rendering, 3D representation, and GPU systems) and vision-language models (reasoning, multimodal understanding, and how visual structure affects model behavior).',
  thesisZh:
    '你好，欢迎来到我的主页。我是清华大学深圳国际研究生院硕士研究生，研究重心在计算机图形学（实时渲染、三维表示与 GPU 系统）与视觉语言模型（推理、多模态理解以及视觉结构如何影响模型行为）。',
  about:
    'On the graphics side, I build engines, renderers, and visualization tools to make pipelines inspectable. On the VLM side, I work on problems such as reasoning efficiency, graph-structured inputs, and forgery detection where fine-grained visual cues matter. Indie game projects are where many of these ideas meet production constraints.',
  aboutZh:
    '在图形方向，我通过引擎、渲染器与可视化工具把管线做成可观察、可实验的系统。在 VLM 方向，我关注推理效率、图结构输入、以及深度伪造检测等依赖细粒度视觉线索的问题。独立游戏制作则让这些想法在真实生产约束下接受检验。',
  interests: ['Neural Rendering', 'GPU Parallel Computing', 'Large-scale Graphics Engineering', 'VLM & Multimodal Reasoning', 'Embodied AI'],
  interestsZh: ['神经渲染', 'GPU 并行计算', '大规模图形学工程', 'VLM 与多模态推理', '具身智能'],
  emails: ['chenlizheme@outlook.com', 'chenlizhe@mails.tsinghua.edu.cn'],
  links: [
    { label: 'GitHub', url: 'https://github.com/ChenlizheMe' },
    { label: 'Google Scholar', url: 'https://scholar.google.com/citations?user=E7pKucIAAAAJ' },
    { label: 'Blog', url: 'https://dreamerchen.com' },
    { label: 'CV', url: '/attaches/CV.pdf' }
  ]
};

export const infernux = {
  name: 'Infernux',
  url: 'https://github.com/ChenlizheMe/Infernux',
  docs: 'https://infernux-engine.com/wiki.html',
  website: 'https://infernux-engine.com/',
  report: 'https://arxiv.org/abs/2604.10263',
  demoVideo:
    'https://player.bilibili.com/player.html?isOutside=true&aid=116318384753366&bvid=BV1jXXaBQE1R&cid=37098294014&p=1',
  videos: [
    { bvid: 'BV1538P6jELT', url: 'https://player.bilibili.com/player.html?bvid=BV1538P6jELT&p=1', chapter: 'DEVELOPMENT', title: 'An engine grows a particle system', titleZh: '引擎一岁，刚长出粒子系统', short: 'Particles', shortZh: '粒子系统' },
    { bvid: 'BV1dSRkBnEXU', url: 'https://player.bilibili.com/player.html?bvid=BV1dSRkBnEXU&p=1', chapter: 'SYSTEMS', title: 'Animation, MCP & engine performance', titleZh: '动画系统、MCP 与引擎性能', short: 'Animation & MCP', shortZh: '动画与 MCP' },
    { bvid: 'BV1jXXaBQE1R', url: 'https://player.bilibili.com/player.html?bvid=BV1jXXaBQE1R&p=1', chapter: 'ORIGIN', title: 'Building an open-source game engine', titleZh: '在清华读研半年，我做了个开源游戏引擎', short: 'The beginning', shortZh: '引擎的起点' }
  ],
  image: '/img/projects/infernux-editor-current.png',
  headline:
    'An open-source game engine, from the rendering core to the editor.',
  headlineZh:
    '从渲染核心到编辑器，持续开发中的开源游戏引擎。',
  summary:
    'I started Infernux to explore real-time rendering through a complete, working engine. It brings together a Vulkan renderer, editor, physics and asset tools.',
  summaryZh:
    '我用 Infernux 实践实时渲染，也逐步把它做成一款完整的游戏引擎。目前包含 Vulkan 渲染器、编辑器、物理系统与资产工具。',
  proposition:
    'It is still deliberately graphics-led: the renderer owns the frame budget, and the editor exists to shrink the gap between an idea and something you can play or profile. A technical report covers batch data paths and optional acceleration when tooling stacks get heavy.',
  propositionZh:
    '它仍然以图形为主导：渲染器掌握帧预算，编辑器的意义在于缩短“想法”到“可玩、可剖帧”之间的距离。另有一份技术报告讨论批量数据路径与工具链变重时的可选加速。',
  layers: [
    {
      title: 'Vulkan rendering core',
      titleZh: 'Vulkan 渲染核心',
      body: 'Forward and deferred paths, PBR materials, cascaded shadows, MSAA, shader reflection, and post-processing—owned in native code where GPU scheduling and barriers are explicit.',
      bodyZh: '前向与延迟路径、PBR 材质、级联阴影、MSAA、着色器反射与后处理——在原生代码中显式管理 GPU 调度与屏障。'
    },
    {
      title: 'Scene, physics & assets',
      titleZh: '场景、物理与资产',
      body: 'Jolt integration, GUID-based assets, dependency tracking, serialization, prefabs, and play-mode isolation so experiments are reproducible, not one-off demos.',
      bodyZh: '集成 Jolt、基于 GUID 的资产与依赖追踪、序列化、预制体与 Play 模式隔离，使实验可复现而非一次性演示。'
    },
    {
      title: 'Editor & pass authoring',
      titleZh: '编辑器与通道编排',
      body: 'Hierarchy, inspectors, scene/game views, project and console tooling, plus RenderGraph / RenderStack-style authoring so pass order and resources stay inspectable.',
      bodyZh: '层级、检视器、场景/游戏视图、工程与控制台等工具，以及 RenderGraph / RenderStack 式编排，使通道顺序与资源关系可检视。'
    },
    {
      title: 'Auto-parallelization',
      titleZh: '自动并行化',
      body: 'I built an automatic parallelization path that runs very fast: in raw compute throughput it is about <strong>7×</strong> Unity in our measurements, while rendering throughput stays roughly on par with Unity.',
      bodyZh: '做了一套自动并行化方案，整体跑得很快：在我们这边的测试里，纯计算吞吐约为 Unity 的 <strong>7 倍</strong>，渲染效率与 Unity 不相上下。'
    }
  ],
  capabilities: [
    'Vulkan forward/deferred rendering, PBR, cascaded shadows, MSAA, shader reflection, post-processing',
    'RenderGraph / RenderStack-style pass composition from the authoring layer',
    'Jolt physics, queries, and collision callbacks synchronized with transforms',
    'Asset database with GUIDs, .meta sidecars, dependency tracking, prefabs',
    'Integrated editor panels for scene, assets, UI, and build/export workflows',
    'Technical report on batch data paths and scripting integration (arXiv:2604.10263)'
  ],
  capabilitiesZh: [
    'Vulkan 前向/延迟渲染、PBR、级联阴影、MSAA、着色器反射与后处理',
    '在编排层进行类 RenderGraph / RenderStack 的通道组合',
    'Jolt 物理、查询及与变换同步的碰撞回调',
    '带 GUID、.meta 侧车、依赖追踪与预制体的资产数据库',
    '用于场景、资源、UI 与构建导出流程的集成编辑器面板',
    '技术报告：批量数据路径与脚本集成（arXiv:2604.10263）'
  ]
};

export const researchDirections = [
  {
    title: 'Neural rendering, GPU parallelism & large-scale graphics',
    titleZh: '神经渲染、GPU 并行与大规模图形工程',
    body: 'Radiance fields / splats, OptiX-class ray tracing, and the kind of CUDA–warp parallel patterns you need when scenes, sensors, or batch sizes stop being toy-sized—plus the engineering discipline to keep a big renderer maintainable.',
    bodyZh: '关注辐射场与高斯泼溅、光线追踪，以及大规模场景与多传感器仿真中的 GPU 并行计算。'
  },
  {
    title: 'Vision-language models',
    titleZh: '视觉语言模型',
    body: 'Reasoning efficiency, multimodal grounding, graph-structured prompts, and vision-heavy security tasks (e.g., forgery detection) where visual detail changes the decision boundary.',
    bodyZh: '推理效率、多模态对齐、图结构提示，以及深度伪造检测等视觉细节会改变决策边界的视觉密集型任务。'
  },
  {
    title: 'Games & competitions',
    titleZh: '游戏与比赛',
    body: 'I make games out of genuine interest—it is a hobby I take seriously. I have joined many game jams and competitions over the years and collected a long list of awards along the way.',
    bodyZh: '做游戏是我的兴趣与爱好，我也会认真投入。这些年参加过大量游戏开发比赛与 Game Jam，拿过不少奖，是很重要的一块生活与成长经历。'
  }
];

export const publications = [
  {
    "title": "Infernux: A Python-Native Game Engine with JIT-Accelerated Scripting",
    "authors": "<u>Lizhe Chen</u>",
    "venue": "arXiv 2026 · cs.GR",
    "venueZh": "arXiv 2026 · cs.GR",
    "level": "preprint",
    "levelLabel": "Technical Report",
    "link": "https://arxiv.org/abs/2604.10263",
    "image": "/img/projects/infernux-editor-current.png",
    "intro": "A technical report on a Python-native game engine and JIT-accelerated scripting.",
    "introZh": "Python 原生游戏引擎与 JIT 加速脚本系统的技术报告。",
    "featured": false,
    "imageKind": "project"
  },
  {
    "title": "Enhancing Spatial Learning under Visual Cues: A Comparative Study of Virtual Environments and Perspectives",
    "authors": "Yifei Zhang, <u>Lizhe Chen</u>, Jun-Hsiang Yao, Zhan Wang, Siming Chen",
    "venue": "Visual Informatics 10(2), 100301, 2026",
    "venueZh": "Visual Informatics 10(2), 100301, 2026",
    "level": "journal",
    "levelLabel": "Journal",
    "link": "https://doi.org/10.1016/j.visinf.2025.100301",
    "intro": "A comparative study of visual cues, virtual environments and viewing perspectives in spatial learning.",
    "introZh": "比较视觉线索、虚拟环境与观察视角对空间学习的影响。",
    "featured": false,
    "image": "/img/papers/spatial-learning.png",
    "imageKind": "figure"
  },
  {
    "title": "CorrDetail: Visual Detail Enhanced Self-Correction for Face Forgery Detection",
    "authors": "Binjia Zhou, Hengrui Lou, <u>Lizhe Chen</u>, Haoyuan Li, Dawei Luo, Shuai Chen, Jie Lei, Zunlei Feng, Yijun Bei",
    "venue": "IJCAI 2025 · 2485–2493",
    "venueZh": "IJCAI 2025 · 2485–2493",
    "level": "conf",
    "levelLabel": "Conference",
    "link": "https://www.ijcai.org/proceedings/2025/277",
    "intro": "Visual detail enhancement and self-correction for interpretable face forgery detection.",
    "introZh": "结合视觉细节增强与自我纠正，实现可解释的人脸伪造检测。",
    "featured": true,
    "image": "/img/papers/corrdetail.png",
    "imageKind": "figure"
  },
  {
    "title": "Innate Reasoning is Not Enough: In-Context Learning Enhances Reasoning Large Language Models with Less Overthinking",
    "authors": "Yuyao Ge, Shenghua Liu, Yiwei Wang, Lingrui Mei, <u>Lizhe Chen</u>, Baolong Bi, Xueqi Cheng",
    "venue": "ACL 2026 · Long Papers",
    "venueZh": "ACL 2026 · Long Papers",
    "level": "conf",
    "levelLabel": "Conference",
    "link": "https://arxiv.org/abs/2503.19602",
    "intro": "An analysis of chain-of-thought prompting and in-context examples for reasoning models and overthinking.",
    "introZh": "分析思维链提示与上下文示例对推理模型表现及过度思考的影响。",
    "featured": false,
    "image": "/img/papers/innate-reasoning.png",
    "imageKind": "figure"
  },
  {
    "title": "Can Graph Descriptive Order Affect Solving Graph Problems with LLMs?",
    "authors": "Yuyao Ge, Shenghua Liu, Baolong Bi, Yiwei Wang, Lingrui Mei, Wenjie Feng, <u>Lizhe Chen</u>, Xueqi Cheng",
    "venue": "ACL 2025 · Long Papers · 6404–6420",
    "venueZh": "ACL 2025 · Long Papers · 6404–6420",
    "level": "conf",
    "levelLabel": "Conference",
    "link": "https://aclanthology.org/2025.acl-long.321/",
    "intro": "A study of how graph description order affects large language models on graph reasoning tasks.",
    "introZh": "研究图的描述顺序如何影响大语言模型求解图推理任务。",
    "featured": false,
    "image": "/img/papers/graph-descriptive.png",
    "imageKind": "figure"
  },
  {
    "title": "PIS: Linking Importance Sampling and Attention Mechanisms for Efficient Prompt Compression",
    "authors": "<u>Lizhe Chen</u>, Binjia Zhou, Yuyao Ge, Jiayi Chen, Shiguang Ni",
    "venue": "arXiv 2025",
    "venueZh": "arXiv 2025",
    "level": "preprint",
    "levelLabel": "Preprint",
    "link": "https://arxiv.org/abs/2504.16574",
    "intro": "Connecting importance sampling with attention mechanisms for efficient prompt compression.",
    "introZh": "将重要性采样与注意力机制联系起来，用于高效提示词压缩。",
    "featured": false,
    "image": "/img/papers/pis.png",
    "imageKind": "figure"
  },
  {
    "title": "FEMA: Emotion-Driven Personification in Generative Agents",
    "authors": "Sihan Shao, Xinshan Qin, Shuangjin Wu, Guanhua Lin, Yu Zhang, <u>Lizhe Chen</u>",
    "venue": "IJCNN 2025",
    "venueZh": "IJCNN 2025",
    "level": "conf",
    "levelLabel": "Conference",
    "link": "https://doi.org/10.1109/ijcnn64981.2025.11229401",
    "intro": "Emotion-driven personification for generative agents.",
    "introZh": "面向生成式智能体的情绪驱动人格化研究。",
    "featured": false,
    "image": "/img/papers/fema.png",
    "imageKind": "figure"
  },
  {
    "title": "3D Human Pose Estimation Using Spatiotemporal Hypergraphs and Its Public Benchmark on Opera Videos",
    "authors": "Xingquan Cai, Haoyu Zhang, <u>Lizhe Chen</u>, Yijie Wu, Haiyan Sun",
    "venue": "The Visual Computer 41, 3309–3327, 2025",
    "venueZh": "The Visual Computer 41, 3309–3327, 2025",
    "level": "journal",
    "levelLabel": "Journal",
    "link": "https://doi.org/10.1007/s00371-024-03604-y",
    "intro": "Spatiotemporal hypergraphs for 3D pose estimation and a public opera-video benchmark. First published online in September 2024.",
    "introZh": "利用时空超图进行三维人体姿态估计，并提供戏曲视频公开基准；2024 年 9 月首次在线发表。",
    "featured": true,
    "image": "/img/papers/3d-pose.png",
    "imageKind": "figure"
  },
  {
    "title": "Frequency-Importance Gaussian Splatting for Real-Time Lightweight Radiance Field Rendering",
    "authors": "<u>Lizhe Chen</u>, Yan Hu, Yu Zhang, Yuyao Ge, Haoyu Zhang, Xingquan Cai",
    "venue": "Multimedia Tools and Applications 83, 83377–83401, 2024",
    "venueZh": "Multimedia Tools and Applications 83, 83377–83401, 2024",
    "level": "journal",
    "levelLabel": "Journal",
    "link": "https://doi.org/10.1007/s11042-024-18679-x",
    "intro": "Frequency-importance Gaussian splatting for lightweight, real-time radiance field rendering.",
    "introZh": "基于频率重要性的高斯泼溅方法，面向轻量实时辐射场渲染。",
    "featured": true,
    "image": "/img/papers/fi-gs.png",
    "imageKind": "figure"
  },
  {
    "title": "Translating Words to Worlds: Zero-Shot Synthesis of 3D Terrain from Textual Descriptions Using Large Language Models",
    "authors": "Guangzi Zhang, <u>Lizhe Chen</u>, Yu Zhang, Yan Liu, Yuyao Ge, Xingquan Cai",
    "venue": "Applied Sciences 14(8), 3257, 2024",
    "venueZh": "Applied Sciences 14(8), 3257, 2024",
    "level": "journal",
    "levelLabel": "Journal",
    "link": "https://www.mdpi.com/2076-3417/14/8/3257",
    "intro": "Zero-shot synthesis of 3D terrain from textual descriptions using large language models.",
    "introZh": "利用大语言模型，从文本描述零样本合成三维地形。",
    "featured": true,
    "image": "/img/papers/words-to-worlds.png",
    "imageKind": "figure"
  },
  {
    "title": "Real-time Non-photorealistic Rendering Method for Black and White Comic Style in Games and Animation",
    "authors": "Yan Hu, <u>Lizhe Chen</u>, Hanna Xie, Yuyao Ge, Shun Zhou, Xingquan Cai",
    "venue": "Journal of System Simulation 36(7), 1699–1712, 2024",
    "venueZh": "系统仿真学报 36(7), 1699–1712, 2024",
    "level": "journal",
    "levelLabel": "Journal",
    "link": "https://www.china-simulation.com/CN/abstract/article/1004-731X/3445",
    "intro": "A real-time non-photorealistic rendering method for black and white comic styles.",
    "introZh": "面向游戏与动漫的黑白漫画风格非真实感实时渲染方法。",
    "featured": false,
    "imageKind": "concept",
    "image": "/img/papers/npr-manga-concept.png"
  },
  {
    "title": "Research on Lightweight 3D Reconstruction Techniques Based on Gaussian Splatting",
    "authors": "Yan Liu, <u>Lizhe Chen</u>, Hanna Xie, Jie Li",
    "venue": "AAIA 2023 · Proceedings published 2024",
    "venueZh": "AAIA 2023 · 论文集出版于 2024 年",
    "level": "conf",
    "levelLabel": "Conference",
    "link": "https://doi.org/10.1145/3603273.3634711",
    "intro": "Lightweight 3D reconstruction based on Gaussian splatting. Presented at AAIA 2023; proceedings published in January 2024.",
    "introZh": "基于高斯泼溅的轻量三维重建研究；会议为 AAIA 2023，论文集于 2024 年 1 月出版。",
    "featured": false,
    "imageKind": "concept",
    "image": "/img/papers/lightweight-3d-concept.png"
  },
  {
    "title": "Attack Based on Data: A Novel Perspective to Attack Sensitive Points Directly",
    "authors": "Yuyao Ge, Zhongguo Yang, <u>Lizhe Chen</u>, Yiming Wang, Chengyang Li",
    "venue": "Cybersecurity 6, 43, 2023",
    "venueZh": "Cybersecurity 6, 43, 2023",
    "level": "journal",
    "levelLabel": "Journal",
    "link": "https://doi.org/10.1186/s42400-023-00179-4",
    "intro": "A data-based perspective on directly attacking sensitive points.",
    "introZh": "从数据出发研究直接攻击敏感点的方法。",
    "featured": false,
    "imageKind": "figure",
    "image": "/img/papers/cybersecurity.png"
  },
  {
    "title": "Vision Transformer Based on Knowledge Distillation in TCM Image Classification",
    "authors": "Yuyao Ge, Yiting Cheng, Jia Wang, Hanlin Zhou, <u>Lizhe Chen</u>",
    "venue": "IEEE CCET 2022",
    "venueZh": "IEEE CCET 2022",
    "level": "conf",
    "levelLabel": "Conference",
    "link": "https://doi.org/10.1109/ccet55412.2022.9906332",
    "intro": "Knowledge distillation for Vision Transformers in traditional Chinese medicine image classification.",
    "introZh": "面向中医图像分类的 Vision Transformer 知识蒸馏研究。",
    "featured": false,
    "imageKind": "concept",
    "image": "/img/papers/vit-tcm-concept.png"
  }
];

export const projects = [
  {
    "name": "Infernux",
    "url": "https://github.com/ChenlizheMe/Infernux",
    "status": "Open Source",
    "statusZh": "开源",
    "image": "/img/projects/infernux-editor-current.png",
    "desc": "An open-source game engine I build from scratch.",
    "descZh": "从零开发的开源游戏引擎。",
    "role": "Creator — renderer, editor, pipeline, release",
    "roleZh": "作者 — 渲染器、编辑器、管线与发布",
    "tags": [
      "Vulkan",
      "C++",
      "Python"
    ],
    "featured": true
  },
  {
    "name": "EmbodiChain",
    "url": "https://github.com/DexForce/EmbodiChain",
    "status": "Contrib",
    "statusZh": "参与",
    "image": "/img/projects/embodichain.png",
    "desc": "DexForce’s GPU-accelerated embodied-AI stack: high-fidelity sim, ray-traced sensors, and scalable training pipelines.",
    "descZh": "跨维端到端 GPU 具身智能栈：高保真仿真、光追传感器与可扩展训练管线。",
    "detail": "EmbodiChain is DexForce’s embodied-AI stack for GPU sim, data, and training. On my side I shipped a <strong>full multi-camera OptiX renderer</strong> inside it (not a single-camera demo), and integrated a <strong>warp-based GPU parallel compute framework</strong> so batches of camera renders and sensor-heavy passes stay on sensible bandwidth/latency budgets. The public pitch is still Sim2Real and big synthetic datasets—I focused on the rendering/compute plumbing that makes that scale.",
    "detailZh": "EmbodiChain 是跨维的具身智能 GPU 仿真与训练栈。我这边落地的是：<strong>完整的多相机 OptiX 渲染器</strong>（不是单机位演示），以及一套<strong>基于 NVIDIA warp 的 GPU 并行计算框架</strong>，嵌进框架里跑多路相机和重传感器管线时，带宽和延迟仍可控。对外叙事仍是 Sim2Real 与大规模合成数据——我主要负责把渲染/算子这层工程打牢。",
    "role": "Rendering — multi-camera OptiX path, warp GPU parallel stack integration",
    "roleZh": "渲染 — 多相机 OptiX 路径、warp GPU 并行框架集成",
    "tags": [
      "Embodied AI",
      "OptiX",
      "Ray Tracing",
      "Simulation",
      "GPU"
    ],
    "featured": true
  }
];

export const games = [
{
  "name": "You Qiu Bi Ying",
  "nameZh": "有求必应",
  "role": "Two-person collaboration · Seven-day prototype",
  "roleZh": "双人合作 · 七日原型",
  "desc": "A card-stacking management game about urban folk wishes, set in a workshop above the clouds.",
  "descZh": "以都市民俗祈愿为主题的卡牌堆叠经营游戏，在云海工坊中为人间制作承载心愿的器物。",
  "detail": "Made with Endless_Beach in seven days, drawing inspiration from Stacklands. Collect incense and materials, combine cards, and fulfill wishes for safety, companionship, and a new beginning.",
  "detailZh": "与 Endless_Beach 合作，用七天完成，设计参考《堆叠大陆》。收集香火与灵材，通过卡牌合成完成订单，回应人们关于平安、陪伴与未来的心愿。",
  "video": "https://player.bilibili.com/player.html?bvid=BV1ZG5F6NEd4&p=1",
  "bilibili": "https://www.bilibili.com/video/BV1ZG5F6NEd4/",
  "tags": [
    "Card Stacking",
    "Management",
    "Prototype"
  ],
  "featured": true
},
  {
    name: 'There Should Be a Cat Here',
    nameZh: '此处应有猫',
    role: 'Technical Art & Client Development',
    roleZh: '技术美术与客户端程序',
    desc: 'TapTap 2024 Spotlight game: you take a weird remote “cat intern” job—point a CCTV laser, nudge stubborn cats, and clear cute light-puzzle goals.',
    descZh: 'TapTap 2024 聚光灯作品：扮演远程「猫咪实习生」，用监控激光逗猫、完成轻解谜目标，偏休闲可爱向。',
    detail:
      'Trailer and gameplay on Bilibili show the loop: monitor UI, laser pointer interaction, and level goals around herding cats. I handled tech art and client work for the build we shipped to the contest.',
    detailZh:
      'B 站宣传片/实机里能看到监控界面、激光指引和围绕逗猫的目标循环。我负责技术美术与客户端侧，把参赛版本打磨到可发布状态。',
    video:
      'https://player.bilibili.com/player.html?isOutside=true&bvid=BV18F1EYREqY&page=1&high_quality=1&danmaku=0',
    bilibili: 'https://www.bilibili.com/video/BV18F1EYREqY',
    awards: 'TapTap 2024 Spotlight — see honors for store stats',
    awardsZh: 'TapTap 2024 聚光灯 — 商店数据见下方荣誉',
    tags: ['Unity', 'Mobile', 'Puzzle', 'TapTap', 'Tech Art']
  },
  {
    name: 'Tree',
    nameZh: '樹',
    homeFeatured: false,
    role: 'Technical Art & Client Development',
    roleZh: '技术美术与客户端程序',
    desc: 'A contemplative game made by a two-person team for CIGA Game Jam 2025.',
    descZh: '2025 CIGA Game Jam 双人团队作品，一款禅系游戏。',
    detail:
      'Watch the original project presentation on Bilibili.',
    detailZh: '可在 B 站观看该作品的原始演示视频。',
    video:
      'https://player.bilibili.com/player.html?isOutside=true&bvid=BV1KT3czoEsP&page=1&high_quality=1&danmaku=0',
    bilibili: 'https://www.bilibili.com/video/BV1KT3czoEsP',
    tags: ['Unity', 'Trailer', 'Bilibili']
  },
  {
    name: 'Unmasking Day',
    nameZh: '卸装日 Unmasking Day',
    role: 'Technical Art & Client Development',
    roleZh: '技术美术与客户端程序',
    desc: 'A retro-styled text deduction game built at Global Game Jam 2026, using AI fiction as the interaction frame.',
    descZh: 'Global Game Jam 2026 完成的复古风文字推理游戏，以 AI 系统作为交互叙事框架。',
    detail:
      '48-hour GGJ build emphasizing monospace UI, shader-driven retro CRT motifs, and narrative pacing through a diegetic “Unmasking” terminal. I owned client architecture, tech-art shaders, and tooling hooks for writers.',
    detailZh:
      '48 小时 GGJ 作品，强调等宽 UI、着色器驱动的复古终端感，以及通过叙事内“卸装”终端控制节奏。我负责客户端架构、技术美术着色器与供编剧使用的工具挂钩。',
    video: 'https://player.bilibili.com/player.html?isOutside=true&aid=115994500532047&bvid=BV1eS64BNEem&cid=35749692453&p=1',
    awards: 'GGJ 2026 Chongqing · Best Art Style & Best Game Design',
    awardsZh: 'GGJ 2026 重庆站 · 最佳美术风格 & 最佳游戏设计',
    tags: ['Unity', 'C#', 'Tech Art', 'Shader', 'Text Adventure']
  },
  {
    name: 'Dong! Da-Dong!',
    extraVideos: [{label:'Competition demo',labelZh:'参赛版本',url:'https://www.bilibili.com/video/BV1HpkyBeEc7/'}],
    awards: 'miHoYo 2025 Game Design Competition · National first place',
    awardsZh: '米哈游 2025 游戏策划大赛 · 全国第一名',
    nameZh: '咚！哒咚！',
    role: 'Technical Art & Client Development',
    roleZh: '技术美术与客户端程序',
    desc: 'A rhythm-action game where drumbeats become contract, battle, and salvation.',
    descZh: '鼓点即契约、即战斗、即拯救的节奏动作游戏。',
    detail:
      'Rhythm-combat prototype with custom shader stacks for stylized drum FX and screen-space punch. I implemented beat-synced VFX, performance-safe mobile targets, and the core client loop for the demo build.',
    detailZh:
      '节奏战斗原型，含自定义着色器栈以呈现鼓点特效与镜头冲击。我实现节拍同步特效、面向性能的移动目标，以及演示版客户端主循环。',
    video: 'https://player.bilibili.com/player.html?isOutside=true&aid=115939370598910&bvid=BV1ufBZBkEp2&cid=35550200975&p=1',
    tags: ['Unity', 'C#', 'Tech Art', 'Rhythm', 'Shader']
  },
  {
    name: 'Organic Dominion',
    nameZh: '有机统治',
    role: 'Technical Art & Client Development',
    roleZh: '技术美术与客户端程序',
    desc: 'An automation-factory meets swarm-evolution strategy game about living production systems.',
    descZh: '融合自动化工厂与虫群进化的策略游戏，围绕活体生产系统展开。',
    detail:
      'Strategy vertical slice blending factory automation and swarm evolution. I built instanced swarm rendering passes, UI-heavy tech-art polish, and profiling hooks to keep draw calls stable when bug counts spike.',
    detailZh:
      '融合工厂自动化与虫群进化的策略垂直切片。我负责实例化虫群渲染通道、偏 UI 向的技术美术打磨，以及 Profiling 挂钩以在单位数量激增时稳定绘制开销。',
    video: 'https://player.bilibili.com/player.html?isOutside=true&aid=115894239889503&bvid=BV1RSrWBhEbr&cid=35398681894&p=1',
    awards: 'Tsinghua SIGS Interactive Media Workshop · Silver Award',
    awardsZh: '清华大学互动媒体技术工作坊 · 银奖',
    tags: ['Unity', 'C#', 'Tech Art', 'Strategy', 'Automation']
  }
];

export const awards = [
  {
    "title": "IEEE ICRA 2025 WBCD Robotics & Automation Competition",
    "titleZh": "IEEE ICRA 2025 WBCD 机器人与自动化大赛",
    "result": "Co-1st place",
    "resultZh": "并列第一名",
    "blurb": "WBCD is the ICRA workshop track on benchmarking collaborative / autonomous driving. The contest ties together simulation, perception, and automation stacks—we placed co-first in the robotics & automation competition thread.",
    "blurbZh": "WBCD 是 ICRA 上围绕协同与自动驾驶评测的工作坊赛道，比赛会把仿真、感知与自动化管线串在一起；我们在机器人与自动化大赛环节拿到并列第一。"
  },
  {
    "title": "miHoYo 2025 Game Design Competition",
    "titleZh": "米哈游 2025 游戏策划大赛",
    "result": "National first place",
    "resultZh": "全国第一名",
    "blurb": "Dong! Da-Dong! won national first place in the miHoYo 2025 Game Design Competition.",
    "blurbZh": "《咚！哒咚！》在米哈游 2025 游戏策划大赛中获得全国第一名。"
  },
  {
    "title": "TapTap 2024 Spotlight",
    "titleZh": "TapTap 2024 聚光灯",
    "result": "2024 campaign: 400K+ views · 50K+ downloads · #2 New Releases",
    "resultZh": "2024 活动期间：浏览 40 万+ · 下载 5 万+ · 新品榜第二",
    "blurb": "TapTap Spotlight is a mobile game incubation season: teams ship a playable slice fast and compete for store featuring. Our entry picked up strong organic traffic during the campaign window.",
    "blurbZh": "TapTap 聚光灯是面向手机游戏的孵化赛季，要在短时间内拿出可玩切片并争取商店推荐位；我们的作品在活动期间拿到了不错的自然流量。"
  },
  {
    "title": "China Virtual Reality Competition (CCVR)",
    "titleZh": "中国虚拟现实大赛（CCVR）",
    "result": "National first prize × 3",
    "resultZh": "全国一等奖 × 3",
    "blurb": "CCVR is a national VR contest in China for student/pro teams; repeated first prizes usually mean the jury liked both the interactive design and stable real-time delivery.",
    "blurbZh": "CCVR 是国内高校与团队常参加的全国性虚拟现实赛事，三次国一说明作品在交互设计和实时演示稳定性上都比较能打。"
  },
  {
    "title": "ACM-ICPC Asia Regional",
    "titleZh": "ACM-ICPC 亚洲区域赛",
    "result": "Bronze medal",
    "resultZh": "铜奖",
    "blurb": "ICPC is the classic collegiate programming contest (teams of three, one keyboard). A regional bronze is still a grind—five hours, tight penalty minutes, and brutal geometry/graph tasks.",
    "blurbZh": "ICPC 是经典的大学生程序设计团队赛（三人一队、一台机器）。区域赛铜奖也不水——五小时、罚时扣得紧，几何/图论题经常把人写麻。"
  },
  {
    "title": "G-Bit Future Game Maker (college division)",
    "titleZh": "吉比特未来游戏制作人大赛（大学生组）",
    "result": "National top 10",
    "resultZh": "全国十强",
    "blurb": "Sponsored by G-bits (a listed Chinese game studio), this contest backs student prototypes with mentorship and publishing eyes—top 10 is the late-stage shortlist.",
    "blurbZh": "由吉比特等发起的面向大学生的游戏制作赛，常有导师与发行视角跟进；全国十强相当于后半程的精选名单。"
  },
  {
    "title": "CUSGA — China University Student Game Dev Competition",
    "titleZh": "CUSGA 中国大学生游戏开发创作大赛",
    "result": "Best multiplayer game",
    "resultZh": "最佳多人游戏",
    "blurb": "CUSGA gathers student teams from many universities; the “best multiplayer” award highlights netcode, session flow, or couch/online play that actually works.",
    "blurbZh": "CUSGA 汇聚多校学生团队；「最佳多人」看重联机或同屏玩法是否扎实——同步、会话流程、手感要比单机多踩不少坑。"
  },
  {
    "title": "Xiamen International Animation Festival — Golden Dolphin (student)",
    "titleZh": "厦门国际动漫节 · 金海豚奖（最佳学生作品）",
    "result": "Nominated",
    "resultZh": "入围",
    "blurb": "Golden Dolphin is the headline award at Xiamen’s animation fest; the student category spotlights school-year projects with festival-level polish.",
    "blurbZh": "金海豚奖是厦门国际动漫节的主单元；学生作品入围意味着完成度和表达在评委眼里达到了节展水准。"
  },
  {
    "title": "Tsinghua SIGS Interactive Media Workshop",
    "titleZh": "清华大学深圳国际研究生院 · 互动媒体技术工作坊",
    "result": "Silver award (Organic Dominion)",
    "resultZh": "银奖（《有机统治》）",
    "blurb": "SIGS workshop course demo fair: faculty and peers judge vertical slices built in a few weeks—silver went to our factory-meets-swarm strategy prototype.",
    "blurbZh": "深研院互动媒体工作坊的阶段性路演，老师和同学一起评几周做出来的垂直切片；我们的工厂+虫群策略原型拿了银奖。"
  }
];

export const education = [
  {
    place: 'Tsinghua University, SIGS',
    placeZh: '清华大学 深圳国际研究生院',
    date: '2025 — Present',
    dateZh: '2025年 — 至今',
    role: 'M.S. in Interactive Media Technology',
    roleZh: '互动媒体技术方向 · 硕士研究生',
    desc: 'Focus: real-time rendering, engine systems, and vision-language model research; coursework bridges graphics and interactive media.',
    descZh: '方向：实时渲染、引擎系统与视觉语言模型相关研究；课程衔接图形学与交互媒体。'
  },
  {
    place: 'North China University of Technology',
    placeZh: '北方工业大学',
    date: '2021 — 2025',
    dateZh: '2021年 — 2025年',
    role: 'B.S. in Digital Media Technology · Rank 1st',
    roleZh: '数字媒体技术 · 工学学士 · 绩点排名第一',
    desc: 'Foundations in graphics programming, real-time engines, and ML; early VLM/LLM collaborations and competition-led game shipping.',
    descZh: '图形编程、实时引擎与机器学习基础；早期 VLM/LLM 合作与竞赛驱动下的游戏交付。'
  }
];

export const workExperience = [
  {
    place: 'Tencent',
    placeZh: '腾讯',
    date: 'Jun 12, 2026 — Present',
    dateZh: '2026年6月12日 — 至今',
    role: 'Engine R&D Intern',
    roleZh: '引擎研发实习生',
    desc: 'Engine R&D internship (in progress); day-to-day focus is neural rendering and shipping it in real engine/tooling loops.',
    descZh: '引擎研发实习（进行中），日常工作重心在神经渲染，以及把它接进真实的引擎与工具链路里。'
  },
  {
    place: 'DexForce Intelligent Digital Tech',
    placeZh: '跨维（深圳）智能数字科技',
    date: 'Mar — Oct 2025',
    dateZh: '2025年3月 — 2025年10月',
    role: 'Data Synthesis Engineer · Intern',
    roleZh: '数据合成工程师 · 实习',
    desc: 'Embodied AI stack: built a full multi-camera OptiX renderer and a warp-based GPU parallel layer inside EmbodiChain, plus sim/engine tooling.',
    descZh: '具身智能栈：在 EmbodiChain 内实现完整多相机 OptiX 渲染器与基于 warp 的 GPU 并行层，并参与仿真/引擎与资产侧工具。'
  }
];
