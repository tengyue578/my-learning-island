import fs from "node:fs";
import path from "node:path";

const outDir = "outputs";
const outFile = path.join(outDir, "baby-learning-park-direct.html");

const html = String.raw`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>宝贝学习乐园</title>
  <style>
    :root{--pink:#ff8fca;--blue:#8fd8ff;--yellow:#ffe477;--green:#9bea9b;--purple:#c9a7ff;--ink:#3f2a75}
    *{box-sizing:border-box}body{margin:0;font-family:"Microsoft YaHei","PingFang SC",Arial,sans-serif;color:var(--ink);background:linear-gradient(135deg,#fff7fb,#eef9ff 45%,#fffbe6);min-height:100vh}
    button{min-height:44px;border:0;border-radius:18px;padding:10px 14px;font:inherit;font-weight:800;color:var(--ink);background:#fff;box-shadow:0 7px 0 rgba(63,42,117,.12);cursor:pointer}button:active{transform:translateY(3px);box-shadow:0 3px 0 rgba(63,42,117,.12)}
    .app{display:grid;grid-template-columns:270px 1fr;min-height:100vh}.side{padding:18px;background:rgba(255,255,255,.82);border-right:4px solid rgba(255,143,202,.32);position:sticky;top:0;height:100vh}.brand{display:flex;gap:10px;align-items:center;font-size:22px;margin-bottom:18px}.brand i{display:grid;place-items:center;width:48px;height:48px;border-radius:16px;background:var(--yellow)}
    .nav{display:grid;gap:10px}.nav button{width:100%;text-align:left;display:flex;gap:10px;align-items:center}.nav small{display:block;font-weight:600;opacity:.72}.main{padding:24px 28px 96px}.top{display:flex;justify-content:space-between;gap:14px;align-items:center;margin-bottom:18px}.chip,.stars{border-radius:999px;background:#fff;padding:10px 16px;font-weight:900;box-shadow:0 8px 24px rgba(63,42,117,.1)}
    h1{font-size:clamp(30px,5vw,54px);margin:10px 0}h2{font-size:28px;margin:10px 0}p{line-height:1.65}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:16px}.card{background:rgba(255,255,255,.92);border:3px solid rgba(255,255,255,.95);border-radius:24px;padding:18px;box-shadow:0 14px 32px rgba(63,42,117,.13)}.c0{background:linear-gradient(145deg,#ffe4f1,#fff)}.c1{background:linear-gradient(145deg,#e5f6ff,#fff)}.c2{background:linear-gradient(145deg,#fff4b8,#fff)}.c3{background:linear-gradient(145deg,#e7ffd9,#fff)}.c4{background:linear-gradient(145deg,#efe1ff,#fff)}
    .module{display:none}.module.active{display:block}.home{display:none}.home.active{display:block}.big{font-size:46px}.letters{display:grid;grid-template-columns:repeat(auto-fit,minmax(82px,1fr));gap:12px}.letter{font-size:34px}.poem{margin-bottom:14px}.pinyin{color:#7f6bb0;font-size:14px}.line{font-size:22px}.options{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-top:12px}.good{background:#caffc7!important}.bad{background:#ffd1dc!important}.pill{display:inline-flex;align-items:center;justify-content:center;min-width:52px;min-height:52px;border-radius:18px;background:#fff;font-size:24px;font-weight:900;margin:4px}.badge{display:inline-flex;margin:6px;padding:10px 12px;border-radius:999px;background:#eee;font-weight:900}.badge.on{background:var(--yellow)}.bottom{display:none}
    @media(max-width:760px){.app{display:block}.side{display:none}.main{padding:16px 14px 92px}.bottom{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;position:fixed;left:0;right:0;bottom:0;background:rgba(255,255,255,.96);padding:8px;border-top:2px solid #eee}.bottom button{border-radius:16px;padding:8px 4px;font-size:12px}.letters{grid-template-columns:repeat(4,1fr)}}
  </style>
</head>
<body>
<div class="app">
  <aside class="side">
    <div class="brand"><i>⭐</i><strong>宝贝学习乐园</strong></div>
    <nav class="nav" id="sideNav"></nav>
    <div class="card" style="margin-top:16px"><b>闯关进度</b><h2><span id="sideDone">0</span>/10</h2></div>
  </aside>
  <main class="main">
    <div class="top"><span class="chip">嗨，小小探险家！</span><span class="stars">⭐ <b id="starCount">0</b> 颗星星</span></div>
    <section id="home" class="home active"></section>
    <section id="letters" class="module"></section>
    <section id="poems" class="module"></section>
    <section id="numbers" class="module"></section>
    <section id="logic" class="module"></section>
    <section id="adventure" class="module"></section>
  </main>
</div>
<nav class="bottom" id="bottomNav"></nav>
<script>
(function(){
  var KEY = "baby-learning-park:v3";
  var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  var nav = [
    {id:"letters", icon:"🔤", title:"字母乐园", desc:"ABC 发音与配对"},
    {id:"poems", icon:"🌸", title:"古诗花园", desc:"8 首古诗跟读"},
    {id:"numbers", icon:"🔢", title:"数字王国", desc:"认数字与算一算"},
    {id:"logic", icon:"🧩", title:"逻辑挑战", desc:"规律图形排序"},
    {id:"adventure", icon:"🏆", title:"闯关冒险", desc:"综合挑战收星星"}
  ];
  var poems = [
    ["静夜思","李白",[["chuáng qián míng yuè guāng","床前明月光"],["yí shì dì shàng shuāng","疑是地上霜"],["jǔ tóu wàng míng yuè","举头望明月"],["dī tóu sī gù xiāng","低头思故乡"]]],
    ["咏鹅","骆宾王",[["é é é","鹅，鹅，鹅"],["qū xiàng xiàng tiān gē","曲项向天歌"],["bái máo fú lǜ shuǐ","白毛浮绿水"],["hóng zhǎng bō qīng bō","红掌拨清波"]]],
    ["春晓","孟浩然",[["chūn mián bù jué xiǎo","春眠不觉晓"],["chù chù wén tí niǎo","处处闻啼鸟"],["yè lái fēng yǔ shēng","夜来风雨声"],["huā luò zhī duō shǎo","花落知多少"]]],
    ["悯农","李绅",[["chú hé rì dāng wǔ","锄禾日当午"],["hàn dī hé xià tǔ","汗滴禾下土"],["shuí zhī pán zhōng cān","谁知盘中餐"],["lì lì jiē xīn kǔ","粒粒皆辛苦"]]],
    ["登鹳雀楼","王之涣",[["bái rì yī shān jìn","白日依山尽"],["huáng hé rù hǎi liú","黄河入海流"],["yù qióng qiān lǐ mù","欲穷千里目"],["gèng shàng yī céng lóu","更上一层楼"]]],
    ["相思","王维",[["hóng dòu shēng nán guó","红豆生南国"],["chūn lái fā jǐ zhī","春来发几枝"],["yuàn jūn duō cǎi xié","愿君多采撷"],["cǐ wù zuì xiāng sī","此物最相思"]]],
    ["寻隐者不遇","贾岛",[["sōng xià wèn tóng zǐ","松下问童子"],["yán shī cǎi yào qù","言师采药去"],["zhǐ zài cǐ shān zhōng","只在此山中"],["yún shēn bù zhī chù","云深不知处"]]],
    ["池上","白居易",[["xiǎo wá chēng xiǎo tǐng","小娃撑小艇"],["tōu cǎi bái lián huí","偷采白莲回"],["bù jiě cáng zōng jì","不解藏踪迹"],["fú píng yī dào kāi","浮萍一道开"]]]
  ];
  var logicQs = [
    ["找规律：粉、蓝、粉、蓝，下面是什么？",["粉","蓝","绿"],"粉"],
    ["图形配对：圆形应该找谁？",["○","□","△"],"○"],
    ["排序：从小到大是哪组？",["1、2、3","3、2、1","2、1、3"],"1、2、3"],
    ["找规律：⭐、⭐、🌙、⭐、⭐，下面是什么？",["🌙","⭐","☀️"],"🌙"]
  ];
  var adventureQs = [
    ["大写 A 的小写朋友是谁？",["a","b","d"],"a"],
    ["数字 3 后面是谁？",["2","4","5"],"4"],
    ["2 + 3 等于几？",["4","5","6"],"5"],
    ["“鹅，鹅，鹅”的下一句是什么？",["曲项向天歌","低头思故乡","春眠不觉晓"],"曲项向天歌"],
    ["粉、蓝、粉、蓝，下面是什么？",["粉","蓝","黄"],"粉"],
    ["哪个是大写字母 M？",["m","M","n"],"M"],
    ["两只小手一共有几根手指？",["5","8","10"],"10"],
    ["8 - 3 等于几？",["4","5","6"],"5"],
    ["“白日依山尽”来自哪首诗？",["登鹳雀楼","静夜思","池上"],"登鹳雀楼"],
    ["哪一组是从小到大？",["1、2、3","5、4、3","2、1、3"],"1、2、3"]
  ];
  var memoryStore = {};
  function readStore(){
    try { return localStorage.getItem(KEY) || "{}"; } catch (error) { return memoryStore[KEY] || "{}"; }
  }
  function writeStore(value){
    try { localStorage.setItem(KEY, value); } catch (error) { memoryStore[KEY] = value; }
  }
  var state;
  try { state = JSON.parse(readStore()); } catch (error) { state = {}; }
  state = Object.assign({stars:0,level:1,done:[],counts:{letters:0,poems:0,numbers:0,logic:0,adventure:0}}, state);

  function el(tag, attrs, children){
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function(key){
      if(key === "class") node.className = attrs[key];
      else if(key === "text") node.textContent = attrs[key];
      else if(key === "onclick") node.addEventListener("click", attrs[key]);
      else node.setAttribute(key, attrs[key]);
    });
    (children || []).forEach(function(child){ node.appendChild(typeof child === "string" ? document.createTextNode(child) : child); });
    return node;
  }
  function clear(id){ var node = document.getElementById(id); node.innerHTML = ""; return node; }
  function save(){
    writeStore(JSON.stringify(state));
    document.getElementById("starCount").textContent = state.stars;
    document.getElementById("sideDone").textContent = state.done.length;
    renderBadges();
  }
  function say(text, lang){
    if(!window.speechSynthesis) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = lang || "zh-CN";
    speechSynthesis.speak(u);
  }
  function go(id){
    document.querySelectorAll(".home,.module").forEach(function(node){ node.classList.remove("active"); });
    document.getElementById(id).classList.add("active");
    scrollTo(0,0);
  }
  function mark(button, ok){
    button.classList.add(ok ? "good" : "bad");
    if(ok){ state.stars += 1; save(); }
  }
  function makeOption(text, answer, after){
    return el("button", {text:String(text), onclick:function(){ mark(this, String(text) === String(answer)); if(after) setTimeout(after, 500); }});
  }
  function renderNav(){
    var side = clear("sideNav");
    side.appendChild(el("button", {text:"🏠 乐园首页", onclick:function(){ go("home"); }}));
    nav.forEach(function(item){
      side.appendChild(el("button", {onclick:function(){ go(item.id); }}, [
        el("span", {text:item.icon}),
        el("span", {}, [el("b", {text:item.title}), el("small", {text:item.desc})])
      ]));
    });
    var bottom = clear("bottomNav");
    nav.forEach(function(item){
      bottom.appendChild(el("button", {onclick:function(){ go(item.id); }}, [document.createTextNode(item.icon), el("br"), document.createTextNode(item.title.replace("乐园","").replace("花园","").replace("王国","").replace("挑战","").replace("冒险",""))]));
    });
  }
  function renderHome(){
    var root = clear("home");
    root.appendChild(el("div", {class:"card c0"}, [
      el("h1", {text:"今天想玩什么？"}),
      el("p", {text:"选一个喜欢的小世界，动动脑、开口读、勇敢闯关。"}),
      el("button", {text:"🚀 继续第 " + state.level + " 关", onclick:function(){ go("adventure"); }})
    ]));
    root.appendChild(el("h2", {text:"五个快乐小世界"}));
    var grid = el("div", {class:"grid"});
    nav.forEach(function(item, i){
      grid.appendChild(el("div", {class:"card c"+i}, [
        el("div", {class:"big", text:item.icon}),
        el("h2", {text:item.title}),
        el("p", {text:item.desc}),
        el("button", {text:"进入", onclick:function(){ go(item.id); }})
      ]));
    });
    root.appendChild(grid);
    root.appendChild(el("div", {class:"card"}, [el("h2", {text:"成就徽章墙"}), el("div", {id:"badges"})]));
  }
  function renderLetters(){
    var root = clear("letters");
    root.appendChild(el("h1", {text:"字母乐园"}));
    root.appendChild(el("p", {text:"点击字母听发音，再玩大小写配对。"}));
    var grid = el("div", {class:"letters"});
    alphabet.forEach(function(letter){
      grid.appendChild(el("button", {class:"letter", onclick:function(){ say(letter, "en-US"); state.counts.letters++; save(); }}, [letter, el("br"), el("small", {text:letter.toLowerCase()})]));
    });
    root.appendChild(grid);
    root.appendChild(el("div", {class:"card"}, [el("h2", {text:"大小写配对"}), el("p", {id:"matchQ"}), el("div", {id:"matchOpts", class:"options"})]));
    newMatch();
  }
  function newMatch(){
    var letter = alphabet[Math.floor(Math.random()*alphabet.length)];
    document.getElementById("matchQ").textContent = "请找到 " + letter + " 的小写朋友";
    var opts = [letter.toLowerCase(), alphabet[(alphabet.indexOf(letter)+3)%26].toLowerCase(), alphabet[(alphabet.indexOf(letter)+8)%26].toLowerCase()].sort(function(){ return Math.random() - 0.5; });
    var box = clear("matchOpts");
    opts.forEach(function(opt){ box.appendChild(makeOption(opt, letter.toLowerCase(), newMatch)); });
  }
  function renderPoems(){
    var root = clear("poems");
    root.appendChild(el("h1", {text:"古诗花园"}));
    poems.forEach(function(poem){
      var card = el("div", {class:"card poem"}, [el("h2", {text:poem[0]}), el("p", {text:poem[1]})]);
      poem[2].forEach(function(line){ card.appendChild(el("div", {class:"pinyin", text:line[0]})); card.appendChild(el("div", {class:"line", text:line[1]})); });
      card.appendChild(el("button", {text:"朗读", onclick:function(){ state.counts.poems++; save(); say(poem[2].map(function(x){return x[1];}).join("，")); }}));
      root.appendChild(card);
    });
  }
  function renderNumbers(){
    var root = clear("numbers");
    root.appendChild(el("h1", {text:"数字王国"}));
    var card = el("div", {class:"card"}, [el("h2", {text:"0-20 数字认知"})]);
    for(var i=0;i<=20;i++){ card.appendChild(el("button", {class:"pill", text:String(i), onclick:(function(n){ return function(){ say(String(n)); }; })(i)})); }
    root.appendChild(card);
    root.appendChild(el("div", {class:"card"}, [el("h2", {text:"10 以内加减法"}), el("p", {id:"mathQ"}), el("div", {id:"mathOpts", class:"options"})]));
    root.appendChild(el("div", {class:"card"}, [el("h2", {text:"数数小游戏"}), el("p", {id:"countItems", class:"big"}), el("div", {id:"countOpts", class:"options"})]));
    newMath(); newCount();
  }
  function newMath(){
    var a = Math.floor(Math.random()*10), b = Math.floor(Math.random()*10), op = Math.random() > 0.5 ? "+" : "-";
    if(op === "-" && b > a){ var t=a; a=b; b=t; }
    var ans = op === "+" ? a+b : a-b;
    if(ans > 10) return newMath();
    document.getElementById("mathQ").textContent = a + " " + op + " " + b + " = ?";
    var opts = [ans, (ans+1)%11, Math.max(0, ans-1)].sort(function(){ return Math.random() - 0.5; });
    var box = clear("mathOpts"); opts.forEach(function(opt){ box.appendChild(makeOption(opt, ans, newMath)); });
  }
  function newCount(){
    var n = 1 + Math.floor(Math.random()*10);
    document.getElementById("countItems").textContent = "🍬".repeat(n);
    var opts = [n, Math.max(1,n-1), Math.min(10,n+1)].sort(function(){ return Math.random() - 0.5; });
    var box = clear("countOpts"); opts.forEach(function(opt){ box.appendChild(makeOption(opt, n, newCount)); });
  }
  function renderLogic(){
    var root = clear("logic"), q = logicQs[Math.floor(Math.random()*logicQs.length)];
    root.appendChild(el("h1", {text:"逻辑挑战"}));
    var card = el("div", {class:"card"}, [el("h2", {text:q[0]})]);
    var box = el("div", {class:"options"}); q[1].forEach(function(opt){ box.appendChild(makeOption(opt, q[2], renderLogic)); });
    card.appendChild(box); root.appendChild(card);
  }
  function renderAdventure(){
    var root = clear("adventure"), idx = Math.min(state.level - 1, adventureQs.length - 1), q = adventureQs[idx];
    root.appendChild(el("h1", {text:"闯关冒险"}));
    var card = el("div", {class:"card"}, [el("h2", {text:"第 " + state.level + " 关"}), el("p", {text:q[0]})]);
    var box = el("div", {class:"options"});
    q[1].forEach(function(opt){
      box.appendChild(el("button", {text:opt, onclick:function(){ var ok = opt === q[2]; mark(this, ok); if(ok){ if(state.done.indexOf(state.level) < 0) state.done.push(state.level); state.level = Math.min(10, state.level + 1); state.counts.adventure++; save(); setTimeout(renderAdventure, 600); } }}));
    });
    card.appendChild(box); root.appendChild(card);
    var route = el("div", {class:"card"}, [el("h2", {text:"星星路线"})]);
    adventureQs.forEach(function(_, i){ route.appendChild(el("span", {class:"pill", text:state.done.indexOf(i+1) >= 0 ? "✅" : String(i+1)})); });
    root.appendChild(route);
  }
  function renderBadges(){
    var box = document.getElementById("badges");
    if(!box) return;
    var data = [
      ["第一颗星", state.stars >= 1], ["星星收集者", state.stars >= 10], ["冒险新星", state.done.length >= 3], ["闯关大师", state.done.length >= 10],
      ["字母小达人", state.counts.letters >= 5], ["古诗小诗人", state.counts.poems >= 3], ["逻辑小天才", state.stars >= 20], ["学习小冠军", state.stars >= 30]
    ];
    box.innerHTML = "";
    data.forEach(function(item){ box.appendChild(el("span", {class:"badge " + (item[1] ? "on" : ""), text:(item[1] ? "🏅 " : "🔒 ") + item[0]})); });
  }
  renderNav(); renderHome(); renderLetters(); renderPoems(); renderNumbers(); renderLogic(); renderAdventure(); save();
})();
</script>
</body>
</html>`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, html, "utf8");
console.log(path.resolve(outFile));
console.log(fs.statSync(outFile).size);
