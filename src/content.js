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
  docs: 'https://chenlizheme.github.io/Infernux/wiki.html',
  website: 'https://chenlizheme.github.io/Infernux/',
  report: 'https://arxiv.org/abs/2604.10263',
  demoVideo:
    'https://player.bilibili.com/player.html?isOutside=true&aid=116318384753366&bvid=BV1jXXaBQE1R&cid=37098294014&p=1',
  image: '/img/projects/infengine.png',
  stars: '662+',
  forks: '52',
  release: 'v0.1.4',
  headline:
    'Every graphics enthusiast wants a renderer to call their own; I pushed that dream one step further—I want a game engine of my own. Infernux is that engine.',
  headlineZh:
    '每一个图形学爱好者都想拥有一个属于自己的渲染器，我把这个愿望往前推了一步——我想拥有一个属于自己的游戏引擎。Infernux 就是这样一款引擎。',
  summary:
    'At its core Infernux is a game engine: Vulkan-first runtime, integrated editor, physics, assets, and a pass stack you can actually reshape. I use it to ship real-time features—forward/deferred paths, PBR, cascaded shadows, post-processing, RenderGraph-style composition—while keeping shaders, passes, and scene data easy to iterate on.',
  summaryZh:
    'Infernux 本质上是一款游戏引擎：Vulkan 运行时、集成编辑器、物理与资产管线，以及可以真正改写的通道栈。我在其中落地并压测实时特性——前向/延迟路径、PBR、级联阴影、后处理、类 RenderGraph 的编排——同时让 shader、通道与场景数据保持可快速迭代。',
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
    bodyZh: '辐射场与高斯泼溅、OptiX 类光追，以及场景/传感器/批量一大就不够玩的 CUDA–warp 并行套路；再加上把大型渲染管线做成可维护工程的那套习惯。'
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
    title: 'Infernux: A Python-Native Game Engine with JIT-Accelerated Scripting',
    authors: '<u>L. Chen</u>',
    venue: 'arXiv 2026 · cs.GR',
    venueZh: 'arXiv 2026 · 计算机图形学',
    level: 'preprint',
    levelLabel: 'Technical Report',
    link: 'https://arxiv.org/abs/2604.10263',
    image: '/img/projects/infengine.png',
    intro:
      'Every graphics kid secretly wants their own engine; mine just would not stay a weekend toy. Infernux is the notebook where I admit that dream out loud—Python on top for iteration, Vulkan underneath for the frame, and a few batchy fast paths so the editor does not eat the budget you fought for.',
    introZh:
      '学图形的人心里多少都藏过「做自己的引擎」这句大话；我的区别大概是没让它停在周末玩具。Infernux 算是一页公开的实验记录：上面用 Python 换迭代速度，底下用 Vulkan 扛帧，再在工具链变重时偷偷铺几条批量快速路——不然调试一开会，帧时间先替你脸红。',
    featured: true
  },
  {
    title: 'Enhancing Spatial Learning under Visual Cues: A Comparative Study of Virtual Environments and Perspectives',
    authors: 'Y. Zhang, <u>L. Chen</u>, J. Yao, Z. Wang, S. Chen',
    venue: 'Visual Informatics, 2026',
    venueZh: 'Visual Informatics, 2026',
    level: 'journal',
    levelLabel: 'Journal',
    link: 'https://doi.org/10.1016/j.visinf.2025.100301',
    intro:
      'We kept the virtual maze honest—same walls, same goals—and only moved the “stage lighting”: where landmarks sit and how dramatic the camera behaves. The punchline is pedestrian but useful: spatial memory is surprisingly sensitive to those cues, which matters if you teach VR or build map UIs.',
    introZh:
      '虚拟场景里找路这件事，听起来不如冰雪和海浪浪漫，却最像日常做产品时会踩的坑。我们把迷宫本体固定住，只动地标和镜头气质，看人的空间记忆跟着怎么飘——结论很朴素：眼睛被怎样「导演」，脑子里的地图就怎样长；做教程和导航界面的人大概会点头。',
    featured: false
  },
  {
    title: 'CorrDetail: Visual Detail Enhanced Self-Correction for Face Forgery Detection',
    authors: 'B. Zhou, H. Lou, <u>L. Chen</u>, H. Li, D. Luo, S. Chen, J. Lei, Z. Feng, Y. Bei',
    venue: 'IJCAI 2025',
    venueZh: 'IJCAI 2025',
    level: 'ccf-a',
    levelLabel: 'CCF-A',
    link: 'https://arxiv.org/abs/2507.05302',
    intro:
      'Deepfakes often win the poster frame and lose the pores. CorrDetail is the small habit of looking twice: if the first verdict feels lazy, the model argues with its own mistake, magnifies the brittle texture band, then merges evidence—less theatre, more “did we actually check the seams?”',
    introZh:
      '伪造脸最狡猾的地方，往往是远景像模像样，近看纹理却经不起推敲。CorrDetail 做的是一件很小但像习惯的事：第一遍若心里发虚，就让模型自己跟自己抬杠——把容易露馅的细节带拿出来再看一眼，再谈融合。像不像画动画时那句「再检查一遍线脚」？只是这次对线脚较真的是网络。',
    featured: true
  },
  {
    title: 'Innate Reasoning is Not Enough: In-Context Learning Enhances Reasoning Large Language Models with Less Overthinking',
    authors: 'Y. Ge, S. Liu, Y. Wang, L. Mei, <u>L. Chen</u>, B. Bi, X. Cheng',
    venue: 'ACL 2025',
    venueZh: 'ACL 2025',
    level: 'ccf-a',
    levelLabel: 'CCF-A',
    link: 'https://arxiv.org/abs/2503.19602',
    intro:
      'Reasoning models can already “do math,” yet they sometimes write a whole essay to feel safe. We chased the boring but practical question: do a few in-context examples still help? Turns out they can trim that overthinking without pretending the model forgot how to think.',
    introZh:
      '推理模型明明会算，却常常在纸上写满自我安慰的步骤——像怕老师扣分的中学生。我们回头问了一句很朴素的话：给几条上下文示范，还会不会帮它？答案有点反直觉：能，而且常常是把「写太多」的毛病先按住，而不是把智商借给它。',
    featured: true
  },
  {
    title: 'Can Graph Descriptive Order Affect Solving Graph Problems with LLMs?',
    authors: 'Y. Ge, S. Liu, B. Bi, Y. Wang, L. Mei, W. Feng, <u>L. Chen</u>, X. Cheng',
    venue: 'ACL 2025',
    venueZh: 'ACL 2025',
    level: 'ccf-a',
    levelLabel: 'CCF-A',
    link: 'https://aclanthology.org/2025.acl-long.321',
    intro:
      'A graph does not change when you permute its edges—but the story you tell about it does. We systematically re-ordered text descriptions (walks that feel like BFS, DFS, PageRank tours) and watched classic tasks tilt; the moral is that “just wording” deserves a seat at the table, not a footnote.',
    introZh:
      '图还是那张图，可一旦要念给大模型听，先念哪条边、后念哪个角，竟像换了一支笔。我们把叙述顺序当成正经变量扫了一遍——BFS 气质的、DFS 气质的、带着 PageRank 口吻的——连通、最短路一类老题居然跟着摇摆。说来好笑：最「文科」的排版，偏偏最理科地改了分数。',
    featured: true
  },
  {
    title: 'PIS: Linking Importance Sampling and Attention Mechanisms for Efficient Prompt Compression',
    authors: '<u>L. Chen</u>, B. Zhou, Y. Ge, J. Chen, S. Ni',
    venue: 'arXiv 2025',
    venueZh: 'arXiv 2025',
    level: 'preprint',
    levelLabel: 'Preprint',
    link: 'https://arxiv.org/abs/2504.16574',
    intro:
      'Long prompts are a tax on every forward pass. PIS borrows a sampler’s instinct—keep probability mass where it matters—and hands it to attention so pruning stops feeling like random vandalism.',
    introZh:
      '长提示词像随身携带的行李，每走一步都要重新过安检。PIS 借的是采样里那句老话：质量要留在该在的地方。把它和注意力对上号之后，砍 token 就不像乱删句子，而更像「知道哪几句其实在划水」。',
    featured: false
  },
  {
    title: 'FEMA: Emotion-Driven Personification in Generative Agents',
    authors: 'S. Shao, X. Qin, S. Wu, G. Lin, Y. Zhang, <u>L. Chen</u>',
    venue: 'IJCNN 2025 · CCF-C',
    venueZh: 'IJCNN 2025 · CCF-C',
    level: 'ccf-c',
    levelLabel: 'CCF-C',
    link: 'https://doi.org/10.1109/ijcnn64981.2025.11229401',
    intro:
      'NPC small talk dies the moment it feels drawn from a hat. FEMA is a modest attempt to let mood steer habit, and habit steer persona—so generated agents at least fake continuity instead of roulette.',
    introZh:
      '生成式角色最容易穿帮的，是情绪像抽签、习惯像刷新。FEMA 想做的其实很小：让「心情」先养成一点惯性，再让惯性沉淀成人格——聊天不至于每一步都换人格。做演示 NPC 时，这点体面有时比堆参数管用。',
    featured: false
  },
  {
    title: '3D Human Pose Estimation Using Spatiotemporal Hypergraphs and Its Public Benchmark on Opera Videos',
    authors: 'X. Cai, H. Zhang, <u>L. Chen</u>, Y. Wu, H. Sun',
    venue: 'The Visual Computer, 2025 · CCF-C',
    venueZh: 'The Visual Computer, 2025 · CCF-C',
    level: 'journal',
    levelLabel: 'CCF-C',
    link: 'https://doi.org/10.1007/s00371-024-03604-y',
    intro:
      'Stage opera stretches bodies into poses that everyday mocap benchmarks barely see—graceful, brutal, and unfair to off-the-shelf lifting. We coupled joints across time with spatiotemporal hypergraphs and released a public bench so the community stops treating those motions as anecdotes.',
    introZh:
      '戏曲身段那种又美又刁的扭法，常见数据集里反而不常出现；拿来当 benchmark 时，总像在说轶事而不是在说科学。我们用时空超图把关节在时间里绑得更紧，又把这个舞台公开出去——希望以后写论文时，别再把「水袖一挥」只当插图说明。',
    featured: false
  },
  {
    title: 'Frequency-Importance Gaussian Splatting for Real-Time Lightweight Radiance Field Rendering',
    authors: '<u>L. Chen</u>, Y. Hu, Y. Zhang, Y. Ge, H. Zhang, X. Cai',
    venue: 'Multimedia Tools and Applications, 2024 · SCI Q2, CCF-C',
    venueZh: 'Multimedia Tools and Applications, 2024 · SCI Q2, CCF-C',
    level: 'journal',
    levelLabel: 'SCI Q2',
    link: 'https://doi.org/10.1007/s11042-024-18679-x',
    intro:
      'Gaussian splatting made real-time fields feel reachable, then VRAM reminded us pride comes before the swap. We asked which frequency bands actually buy pixels, folded that bias into primitives and losses, and let density grow only where the signal—not ego—asks for it.',
    introZh:
      '高斯泼溅把实时辐射场从「能跑」推到「像样」，紧接着显存就来收学费。我们索性问一句老实话：哪些频带真在换观感？把答案写进基元和损失里，再让密度只在信号需要的地方长——虚荣粒子能少一颗是一颗。',
    featured: false
  },
  {
    title: 'Translating Words to Worlds: Zero-Shot Synthesis of 3D Terrain from Textual Descriptions Using LLMs',
    authors: 'G. Zhang, <u>L. Chen</u>, Y. Zhang, Y. Liu, Y. Ge, X. Cai',
    venue: 'Applied Sciences, 2024 · SCI Q1',
    venueZh: 'Applied Sciences, 2024 · SCI Q1',
    level: 'journal',
    levelLabel: 'SCI Q1',
    link: 'https://www.mdpi.com/2076-3417/14/8/3257',
    intro:
      'We wanted hills from paragraphs without summoning a planet-sized diffusion stack: a Voronoi scaffold, a behavior tree that reads almost like chain-of-thought for terrain, and tiny bickering editor-agents that nag the heightfield until it matches the tale.',
    introZh:
      '想把一段描写落成山脊河谷，又不愿先祭出一整座扩散模型的大阵仗。于是先铺 Voronoi 当骨架，再用行为树把文字拆成「怎么走笔」；最后放几个爱抬杠的小编辑智能体，对着网格絮絮叨叨，直到地貌和剧情对上号——有点像写长篇小说时互相改稿的那帮人。',
    featured: false
  },
  {
    title: 'Real-time Non-photorealistic Rendering Method for Black and White Comic Style in Games and Animation',
    authors: 'Y. Hu, <u>L. Chen</u>, H. Xie, Y. Ge, S. Zhou, X. Cai',
    venue: 'Journal of System Simulation, 2024',
    venueZh: '系统仿真学报, 2024',
    level: 'journal',
    levelLabel: 'Journal',
    link: 'https://doi.org/10.16182/j.issn1004731x.joss.23-0458',
    intro:
      'Comic ink wants crisp halftone without renting a render farm. The pipeline is almost embarrassingly practical: stylized lighting to separate figure from ground, a three-pass edge hunt in screen space, then region-wise halftone versus ink—built for GPUs you already own.',
    introZh:
      '黑白漫的网点与墨线，最馋的是利落，最怕的是重。我们的路子很土：先用人造光照把主体从背景里托出来，再在屏幕空间分三步「摸边」，最后按区域在网点与墨线之间插值——像有位原画师在盯帧，只是这位原画师住在 shader 里，跑在你手边的显卡上。',
    featured: false
  },
  {
    title: 'Research on Lightweight 3D Reconstruction Techniques Based on Gaussian Splatting',
    authors: 'Y. Liu, <u>L. Chen</u>, H. Xie, J. Li',
    venue: "Proc. Int'l Conf. Advances in AI and Applications (AAIA), 2023",
    venueZh: '人工智能及应用国际会议 (AAIA), 2023',
    level: 'conf',
    levelLabel: 'Conf',
    link: 'https://doi.org/10.1145/3603273.3634711',
    intro:
      'Before splats were everywhere, we were already shaving them for lab-sized budgets—fewer Gaussians to lug around, faster iteration for small teams, and the engineering honesty to admit what you lose when you strip weight.',
    introZh:
      '高斯泼溅后来成了显学，这篇写得更早，也更像课程笔记：粒子少带几颗、迭代就能轻快些，小团队也敢玩。回头看，它提醒一件朴素的事——表示一瘦，承诺也要跟着瘦，别把「还能看」吹成「一样好」。',
    featured: false
  },
  {
    title: 'Attack Based on Data: A Novel Perspective to Attack Sensitive Points Directly',
    authors: 'Y. Ge, Z. Yang, <u>L. Chen</u>, Y. Wang, C. Li',
    venue: 'Cybersecurity, 2023 · CCF-C',
    venueZh: 'Cybersecurity, 2023 · CCF-C',
    level: 'ccf-c',
    levelLabel: 'CCF-C',
    link: 'https://doi.org/10.1186/s42400-023-00179-4',
    intro:
      'Some defenses polish the API while the training data still whispers where it hurts. We followed that whisper—aiming at statistically sensitive mass instead of only the obvious interface—so the threat model reads less like a movie hacker and more like a careful statistician.',
    introZh:
      '有的防线把大门擦得锃亮，数据却在角落里小声说「这里好欺负」。这篇换了个不那么戏剧化的视角：少拍接口特写，多盯统计上发软的那块质量分布——像做实验前先问「样本到底被谁牵着走」，而不是只问「权重被谁牵着走」。',
    featured: false
  },
  {
    title: 'Vision Transformer Based on Knowledge Distillation in TCM Image Classification',
    authors: 'Y. Ge, Y. Cheng, J. Wang, H. Zhou, <u>L. Chen</u>',
    venue: 'IEEE CCET 2022',
    venueZh: 'IEEE 计算机与通信工程技术国际会议 (CCET), 2022',
    level: 'conf',
    levelLabel: 'Conf',
    link: 'https://doi.org/10.1109/ccet55412.2022.9906332',
    intro:
      'TCM imaging is the old story—small folders, heavy stakes. We kept the textbook recipe (big ViT teacher, modest student) but cared most about the textures clinicians actually squint at, not leaderboard vanity.',
    introZh:
      '中医影像常常是「样本不多、责任很重」的老故事。我们没发明新魔法，只是把大 ViT 请来讲课、让小网络当学徒——真正较劲的是：大夫眯眼去看的那点纹理，学生有没有学到，而不是榜上的小数点多跳了零点几。',
    featured: false
  }
];

export const projects = [
  {
    name: 'Infernux',
    url: infernux.url,
    status: 'Open Source',
    statusZh: '开源',
    image: infernux.image,
    desc: 'Game engine from scratch: Vulkan runtime, integrated editor, and a pass stack you can reshape—born from wanting my own renderer, taken one step further.',
    descZh: '从零搭建的游戏引擎：Vulkan 运行时、集成编辑器与可改写的通道栈——源于“自己的渲染器”，并再往前一步做成完整引擎。',
    detail:
      'Infernux is my primary open-source game engine. Native C++17 / Vulkan owns the frame: PBR, cascaded shadows, MSAA, shader reflection, and post-processing. An integrated editor (scene/game views, hierarchy, inspectors, asset pipeline) keeps projects shippable and experiments reproducible. Pass composition follows a RenderGraph / RenderStack-style model so resource flow stays visible. The arXiv technical report documents batch-oriented engine integration and optional acceleration for tooling-heavy loops alongside the rendering core.',
    detailZh:
      'Infernux 是我主要的开源游戏引擎。C++17 / Vulkan 原生层负责帧级工作：PBR、级联阴影、MSAA、着色器反射与后处理。集成编辑器（场景/游戏视图、层级、检视器与资产管线）让项目可交付、实验可复现。通道组合采用 RenderGraph / RenderStack 式模型，使资源流动可检视。arXiv 技术报告在渲染核心之外，还记录面向批量的引擎集成与工具链重负载时的可选加速。',
    role: 'Creator — renderer, editor, pipeline, release',
    roleZh: '作者 — 渲染器、编辑器、管线与发布',
    tags: ['Vulkan', 'Real-time Rendering', 'RenderGraph', 'Editor', 'Graphics Research'],
    featured: true
  },
  {
    name: 'Vultorch',
    url: 'https://github.com/ChenlizheMe/Vultorch',
    status: 'Open Source',
    statusZh: '开源',
    image: '/img/projects/vultorch.png',
    desc: 'GPU-native tensor visualization: CUDA tensors displayed through Vulkan without CPU readback; optional true zero-copy via shared GPU memory.',
    descZh: 'GPU 原生张量可视化：通过 Vulkan 直接显示 CUDA 张量、避免 CPU 回读；可选基于共享显存的真零拷贝。',
    detail:
      'Vultorch targets the graphics–compute boundary: <code>show()</code> keeps data on the GPU with a fast GPU→GPU path into Vulkan; <code>create_tensor()</code> can back tensors with Vulkan shared memory for zero memcpy. The stack pairs a C++ core (Vulkan, CUDA interop, ImGui, optional 3D scene view with MSAA and Blinn–Phong) with a declarative Python API (View → Panel → Canvas) for live training monitors, neural rendering debuggers, and multi-channel depth/normal viewers. It is MIT-licensed with packaged wheels and MkDocs tutorials.',
    detailZh:
      'Vultorch 面向图形与计算的交界：<code>show()</code> 将数据留在 GPU，经快速 GPU→Vulkan 路径上屏；<code>create_tensor()</code> 可用 Vulkan 共享显存支撑张量，实现零 memcpy。技术栈为 C++ 核心（Vulkan、CUDA 互操作、ImGui、可选带 MSAA 与 Blinn–Phong 的 3D 场景视图）与声明式 Python API（View → Panel → Canvas），适用于训练过程监视、神经渲染调试与多通道深度/法线查看等。MIT 协议，提供打包 wheel 与 MkDocs 文档。',
    role: 'Creator — Vulkan/CUDA interop, Python API, docs & packaging',
    roleZh: '作者 — Vulkan/CUDA 互操作、Python API、文档与打包',
    tags: ['Vulkan', 'CUDA', 'GPU Viz', 'Zero-Copy', 'Graphics'],
    featured: true
  },
  {
    name: 'Ailurus OS',
    url: 'https://github.com/ChenlizheMe/AilurusEngine',
    status: 'Open Source',
    statusZh: '开源',
    image: '/img/projects/ailurus.png',
    desc: 'Local-first desktop workbench for VLM/LLM tooling: Electron shell, React UI, pluggable apps with capability manifests.',
    descZh: '面向 VLM/LLM 工具链的本地优先桌面工作台：Electron 壳、React 界面、带能力清单的可插拔应用。',
    detail:
      'Ailurus OS (codename Machiavelli) is a local-first “desktop OS” for building and running model-facing tools offline. Electron provides the shell; React + Vite powers the UI; a Flask-based runtime routes agent calls to pluggable apps under <code>apps/</code>, each described by <code>ailurus.json</code> (frontend entry, backend entry, capability schemas). I use it to prototype VLM/LLM workflows—dataset browsers, prompt routers, small annotation utilities—without shipping data to a hosted IDE. Packaging supports <code>.ail</code> bundles for third-party plugins.',
    detailZh:
      'Ailurus OS（代号 Machiavelli）是面向模型工具、本地优先的“桌面操作系统”式工作台。Electron 提供桌面壳；React + Vite 负责界面；基于 Flask 的运行时将智能体调用路由到 <code>apps/</code> 下的可插拔应用，每个应用由 <code>ailurus.json</code> 描述（前端入口、后端入口、能力模式）。我将其用于快速搭建 VLM/LLM 相关工具原型——数据浏览、提示路由、小型标注工具等——而无需把数据交给云端 IDE。支持 <code>.ail</code> 包分发第三方插件。',
    role: 'Architecture — shell, runtime routing, app manifest design',
    roleZh: '架构 — 桌面壳、运行时路由与应用清单设计',
    tags: ['VLM', 'LLM Tools', 'Electron', 'React', 'Local-first'],
    featured: true
  },
  {
    name: 'EmbodiChain',
    url: 'https://github.com/DexForce/EmbodiChain',
    status: 'Contrib',
    statusZh: '参与',
    image: '/img/projects/embodichain.png',
    desc: 'DexForce’s GPU-accelerated embodied-AI stack: high-fidelity sim, ray-traced sensors, and scalable training pipelines.',
    descZh: '跨维端到端 GPU 具身智能栈：高保真仿真、光追传感器与可扩展训练管线。',
    detail:
      'EmbodiChain is DexForce’s embodied-AI stack for GPU sim, data, and training. On my side I shipped a <strong>full multi-camera OptiX renderer</strong> inside it (not a single-camera demo), and integrated a <strong>warp-based GPU parallel compute framework</strong> so batches of camera renders and sensor-heavy passes stay on sensible bandwidth/latency budgets. The public pitch is still Sim2Real and big synthetic datasets—I focused on the rendering/compute plumbing that makes that scale.',
    detailZh:
      'EmbodiChain 是跨维的具身智能 GPU 仿真与训练栈。我这边落地的是：<strong>完整的多相机 OptiX 渲染器</strong>（不是单机位演示），以及一套<strong>基于 NVIDIA warp 的 GPU 并行计算框架</strong>，嵌进框架里跑多路相机和重传感器管线时，带宽和延迟仍可控。对外叙事仍是 Sim2Real 与大规模合成数据——我主要负责把渲染/算子这层工程打牢。',
    role: 'Rendering — multi-camera OptiX path, warp GPU parallel stack integration',
    roleZh: '渲染 — 多相机 OptiX 路径、warp GPU 并行框架集成',
    tags: ['Embodied AI', 'OptiX', 'Ray Tracing', 'Simulation', 'GPU'],
    featured: true
  }
];

export const games = [
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
    name: 'Extra trailer (Bilibili)',
    nameZh: '宣传片 / 实机（Bilibili）',
    role: 'Technical Art & Client Development',
    roleZh: '技术美术与客户端程序',
    desc: 'Another short trailer or gameplay cut from the same batch of jams/spotlight work—hosted on Bilibili for sharing.',
    descZh: '同一批比赛/聚光灯相关的另一条短片或实机剪辑，放在 B 站方便转发。（若页面提示验证，可直接在 B 站 App 内打开。）',
    detail:
      'Use this as a second entry point if you want a different cut than the main “cat intern” video above.',
    detailZh: '如果你想看另一条剪辑版本，可以点这里；和上面的《此处应有猫》主片互为补充。',
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
    title: 'IEEE ICRA 2025 WBCD Robotics & Automation Competition',
    titleZh: 'IEEE ICRA 2025 WBCD 机器人与自动化大赛',
    result: 'Co-1st place',
    resultZh: '并列第一名',
    blurb:
      'WBCD is the ICRA workshop track on benchmarking collaborative / autonomous driving. The contest ties together simulation, perception, and automation stacks—we placed co-first in the robotics & automation competition thread.',
    blurbZh:
      'WBCD 是 ICRA 上围绕协同与自动驾驶评测的工作坊赛道，比赛会把仿真、感知与自动化管线串在一起；我们在机器人与自动化大赛环节拿到并列第一。'
  },
  {
    title: 'TapTap 2024 Spotlight',
    titleZh: 'TapTap 2024 聚光灯',
    result: '400K+ views · 50K+ downloads · #2 New Releases',
    resultZh: '浏览 40 万+ · 下载 5 万+ · 新品榜第二',
    blurb:
      'TapTap Spotlight is a mobile game incubation season: teams ship a playable slice fast and compete for store featuring. Our entry picked up strong organic traffic during the campaign window.',
    blurbZh:
      'TapTap 聚光灯是面向手机游戏的孵化赛季，要在短时间内拿出可玩切片并争取商店推荐位；我们的作品在活动期间拿到了不错的自然流量。'
  },
  {
    title: 'China Virtual Reality Competition (CCVR)',
    titleZh: '中国虚拟现实大赛（CCVR）',
    result: 'National first prize × 3',
    resultZh: '全国一等奖 × 3',
    blurb:
      'CCVR is a national VR contest in China for student/pro teams; repeated first prizes usually mean the jury liked both the interactive design and stable real-time delivery.',
    blurbZh:
      'CCVR 是国内高校与团队常参加的全国性虚拟现实赛事，三次国一说明作品在交互设计和实时演示稳定性上都比较能打。'
  },
  {
    title: 'ACM-ICPC Asia Regional',
    titleZh: 'ACM-ICPC 亚洲区域赛',
    result: 'Bronze medal',
    resultZh: '铜奖',
    blurb:
      'ICPC is the classic collegiate programming contest (teams of three, one keyboard). A regional bronze is still a grind—five hours, tight penalty minutes, and brutal geometry/graph tasks.',
    blurbZh:
      'ICPC 是经典的大学生程序设计团队赛（三人一队、一台机器）。区域赛铜奖也不水——五小时、罚时扣得紧，几何/图论题经常把人写麻。'
  },
  {
    title: 'G-Bit Future Game Maker (college division)',
    titleZh: '吉比特未来游戏制作人大赛（大学生组）',
    result: 'National top 10',
    resultZh: '全国十强',
    blurb:
      'Sponsored by G-bits (a listed Chinese game studio), this contest backs student prototypes with mentorship and publishing eyes—top 10 is the late-stage shortlist.',
    blurbZh:
      '由吉比特等发起的面向大学生的游戏制作赛，常有导师与发行视角跟进；全国十强相当于后半程的精选名单。'
  },
  {
    title: 'CUSGA — China University Student Game Dev Competition',
    titleZh: 'CUSGA 中国大学生游戏开发创作大赛',
    result: 'Best multiplayer game',
    resultZh: '最佳多人游戏',
    blurb:
      'CUSGA gathers student teams from many universities; the “best multiplayer” award highlights netcode, session flow, or couch/online play that actually works.',
    blurbZh:
      'CUSGA 汇聚多校学生团队；「最佳多人」看重联机或同屏玩法是否扎实——同步、会话流程、手感要比单机多踩不少坑。'
  },
  {
    title: 'Xiamen International Animation Festival — Golden Dolphin (student)',
    titleZh: '厦门国际动漫节 · 金海豚奖（最佳学生作品）',
    result: 'Nominated',
    resultZh: '入围',
    blurb:
      'Golden Dolphin is the headline award at Xiamen’s animation fest; the student category spotlights school-year projects with festival-level polish.',
    blurbZh:
      '金海豚奖是厦门国际动漫节的主单元；学生作品入围意味着完成度和表达在评委眼里达到了节展水准。'
  },
  {
    title: 'Tsinghua SIGS Interactive Media Workshop',
    titleZh: '清华大学深圳国际研究生院 · 互动媒体技术工作坊',
    result: 'Silver award (Organic Dominion)',
    resultZh: '银奖（《有机统治》）',
    blurb:
      'SIGS workshop course demo fair: faculty and peers judge vertical slices built in a few weeks—silver went to our factory-meets-swarm strategy prototype.',
    blurbZh:
      '深研院互动媒体工作坊的阶段性路演，老师和同学一起评几周做出来的垂直切片；我们的工厂+虫群策略原型拿了银奖。'
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
