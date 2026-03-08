(() => {
  "use strict";

  const SPRITES = {
    player:"🧔", wall:"🧱", floor:".", ladder:"🪜", orb:"🟣", starBeam:"✨",
    dog:"🐕", wolf:"🐺", lion:"🦁", dragon:"🐉", ghost:"👻", zombie:"🧟", skull:"☠️", invader:"👾", spider:"🕷️", chick:"🐥", mimic:"🎁", rain:"🌧️",
    food:"🍙", meat:"🥩", sushi:"🍣", feast:"🍖", potion:"🧪", map:"👁", shield:"🛡️", axe:"🪓", diamond:"💎", dagger:"🗡️", star:"🌟", sun:"🌤️", poop:"💩", bean:"🫘", asahiyama:"🏔️"
  };

  const ENEMY_DEFS = [
    {id:1,key:"dog",char:SPRITES.dog,baseHp:6,baseAtk:2,baseDef:0,exp:1,score:10,dropRuleRef:"enemyCommon"},
    {id:2,key:"wolf",char:SPRITES.wolf,baseHp:10,baseAtk:4,baseDef:1,exp:3,score:35,dropRuleRef:"enemyCommon"},
    {id:3,key:"lion",char:SPRITES.lion,baseHp:12,baseAtk:6,baseDef:2,exp:5,score:60,dropRuleRef:"enemyCommon"},
    {id:4,key:"dragon",char:SPRITES.dragon,baseHp:20,baseAtk:8,baseDef:3,exp:10,score:120,dropRuleRef:"enemyCommon"},
    {id:5,key:"ghost",char:SPRITES.ghost,baseHp:12,baseAtk:4,baseDef:1,exp:6,score:70,dropRuleRef:"enemyCommon"},
    {id:6,key:"zombie",char:SPRITES.zombie,baseHp:13,baseAtk:4,baseDef:1,exp:5,score:45,dropRuleRef:"enemyCommon"},
    {id:7,key:"skull",char:SPRITES.skull,baseHp:15,baseAtk:5,baseDef:1,exp:7,score:80,dropRuleRef:"enemyCommon"},
    {id:8,key:"invader",char:SPRITES.invader,baseHp:18,baseAtk:8,baseDef:3,exp:15,score:160,dropRuleRef:"enemyCommon"},
    {id:9,key:"spider",char:SPRITES.spider,baseHp:7,baseAtk:4,baseDef:1,exp:3,score:30,dropRuleRef:"enemyCommon"},
    {id:10,key:"chick",char:SPRITES.chick,baseHp:100,baseAtk:0,baseDef:1,exp:50,score:0,dropRule:{mode:"none"}},
    {id:11,key:"mimic",char:SPRITES.mimic,baseHp:15,baseAtk:7,baseDef:2,exp:8,score:90,dropRuleRef:"mimicRare",flags:["specialDrop"]},
    {id:12,key:"rain",char:SPRITES.rain,baseHp:10,baseAtk:0,baseDef:1,exp:5,score:55,dropRuleRef:"enemyCommon"}
  ];

  const ITEM_DEFS = [
    {id:1,key:"food",char:SPRITES.food,category:"food",rarity:1,effectKey:"food",pickupMode:"inventory"},
    {id:2,key:"meat",char:SPRITES.meat,category:"food",rarity:1,effectKey:"meat",pickupMode:"inventory"},
    {id:3,key:"sushi",char:SPRITES.sushi,category:"food",rarity:2,effectKey:"sushi",pickupMode:"inventory"},
    {id:4,key:"feast",char:SPRITES.feast,category:"food",rarity:4,effectKey:"feast",pickupMode:"inventory"},
    {id:5,key:"potion",char:SPRITES.potion,category:"heal",rarity:1,effectKey:"potion",pickupMode:"inventory"},
    {id:6,key:"map",char:SPRITES.map,category:"utility",rarity:2,effectKey:"map",pickupMode:"inventory"},
    {id:7,key:"sun",char:SPRITES.sun,category:"utility",rarity:2,effectKey:"sun",pickupMode:"instant"},
    {id:8,key:"shield",char:SPRITES.shield,category:"armor",rarity:3,effectKey:"shield",pickupMode:"instant"},
    {id:9,key:"axe",char:SPRITES.axe,category:"weapon",rarity:3,effectKey:"axe",pickupMode:"inventory"},
    {id:10,key:"diamond",char:SPRITES.diamond,category:"armor",rarity:3,effectKey:"diamond",pickupMode:"inventory"},
    {id:11,key:"dagger",char:SPRITES.dagger,category:"weapon",rarity:3,effectKey:"dagger",pickupMode:"instant"},
    {id:12,key:"star",char:SPRITES.star,category:"utility",rarity:5,effectKey:"star",pickupMode:"inventory"},
    {id:13,key:"poop",char:SPRITES.poop,category:"junk",rarity:2,effectKey:"poop",pickupMode:"inventory"},
    {id:14,key:"bean",char:SPRITES.bean,category:"growth",rarity:4,effectKey:"bean",pickupMode:"instant"}
  ];

  const ITEM_DEF_BY_KEY = Object.fromEntries(ITEM_DEFS.map((d)=>[d.key,d]));
  const ITEM_DEF_BY_ID = Object.fromEntries(ITEM_DEFS.map((d)=>[d.id,d]));

  function itemDefByKey(key){ return ITEM_DEF_BY_KEY[key] || null; }
  function itemDefById(id){ return ITEM_DEF_BY_ID[id] || null; }
  function itemKeyFromDropEntry(entry){
    if(!entry) return null;
    if(entry.key) return entry.key;
    if(entry.type) return entry.type;
    if(entry.id !== undefined){
      const byId = itemDefById(entry.id);
      return byId ? byId.key : null;
    }
    return null;
  }
  function normalizeDropPool(pool=[]){
    return pool
      .map((entry)=>({key:itemKeyFromDropEntry(entry), weight:entry.weight ?? entry.rate ?? entry.w ?? 0}))
      .filter((entry)=>entry.key && entry.weight>0);
  }

  const DROP_MODE = {PROFILE:"profile", FIXED:"fixed", POOL:"pool", NONE:"none"};

  const DROP_PROFILES = {
    floorCommon: normalizeDropPool([
      {key:"food",weight:0.15}, {key:"meat",weight:0.14}, {key:"sushi",weight:0.13}, {key:"potion",weight:0.18},
      {key:"map",weight:0.07}, {key:"sun",weight:0.06}, {key:"diamond",weight:0.05}, {key:"axe",weight:0.05},
      {key:"dagger",weight:0.05}, {key:"shield",weight:0.05}, {key:"feast",weight:0.02}, {key:"star",weight:0.01},
      {key:"poop",weight:0.04}
    ]),
    enemyCommon: normalizeDropPool([
      {key:"food",weight:0.13}, {key:"meat",weight:0.12}, {key:"sushi",weight:0.16}, {key:"potion",weight:0.22},
      {key:"map",weight:0.09}, {key:"sun",weight:0.06}, {key:"diamond",weight:0.035}, {key:"axe",weight:0.055},
      {key:"dagger",weight:0.035}, {key:"shield",weight:0.025}, {key:"feast",weight:0.02}, {key:"star",weight:0.01},
      {key:"poop",weight:0.04}
    ]),
    mimicRare: normalizeDropPool([
      {key:"potion",weight:0.06}, {key:"diamond",weight:0.15}, {key:"axe",weight:0.15}, {key:"dagger",weight:0.20},
      {key:"shield",weight:0.20}, {key:"feast",weight:0.10}, {key:"star",weight:0.05}, {key:"poop",weight:0.05}, {key:"bean",weight:0.04}
    ]),
    chestCommon: normalizeDropPool([
      {key:"potion",weight:0.45}, {key:"feast",weight:0.05}, {key:"map",weight:0.10}, {key:"sun",weight:0.10}, {key:"poop",weight:0.30}
    ]),
    starter: normalizeDropPool([
      {key:"meat",weight:0.20}, {key:"sushi",weight:0.20}, {key:"potion",weight:0.20}, {key:"diamond",weight:0.05},
      {key:"axe",weight:0.05}, {key:"dagger",weight:0.05}, {key:"shield",weight:0.05}, {key:"feast",weight:0.05},
      {key:"star",weight:0.01}, {key:"poop",weight:0.04}
    ])
  };

  const FLOOR_ITEM_RULE = {mode:DROP_MODE.PROFILE, ref:"floorCommon"};
  const ENEMY_DROP_CHANCE = 0.22;
  const ENEMY_DEFAULT_DROP_RULE = {mode:DROP_MODE.PROFILE, ref:"enemyCommon", chance:ENEMY_DROP_CHANCE};
  const CHEST_DROP_RULE = {mode:DROP_MODE.PROFILE, ref:"chestCommon"};
  const STARTER_DROP_RULE = {mode:DROP_MODE.PROFILE, ref:"starter"};

  const ENEMY_DEF_BY_KEY = Object.fromEntries(ENEMY_DEFS.map((d)=>[d.key,d]));
  const ENEMY_DEF_BY_ID = Object.fromEntries(ENEMY_DEFS.map((d)=>[d.id,d]));
  const ENEMY_KILL_KEYS = ENEMY_DEFS.map((d)=>d.key);

  function enemyDefByKey(key){ return ENEMY_DEF_BY_KEY[key] || null; }
  function enemyDefById(id){ return ENEMY_DEF_BY_ID[id] || null; }
  function enemyDefFromInstance(enemy){ return enemyDefByKey(enemy?.key || ""); }
  function buildEmptyKillMap(){ return Object.fromEntries(ENEMY_KILL_KEYS.map((key)=>[key,0])); }
  function enemyDropRule(defOrKey){
    const def = typeof defOrKey === "string" ? enemyDefByKey(defOrKey) : defOrKey;
    if(!def) return ENEMY_DEFAULT_DROP_RULE;
    if(def.dropRule) return def.dropRule;
    if(def.dropRuleRef) return {mode:DROP_MODE.PROFILE, ref:def.dropRuleRef, chance:ENEMY_DROP_CHANCE};
    return ENEMY_DEFAULT_DROP_RULE;
  }

  const FLOOR_ENEMY_TABLES = [
    {min:1,max:2,pool:[{enemyKey:"dog",w:60},{enemyKey:"wolf",w:28},{enemyKey:"ghost",w:12}]},
    {min:3,max:4,pool:[{enemyKey:"dog",w:38},{enemyKey:"wolf",w:30},{enemyKey:"lion",w:16},{enemyKey:"ghost",w:8},{enemyKey:"spider",w:8}]},
    {min:5,max:8,pool:[{enemyKey:"wolf",w:32},{enemyKey:"lion",w:22},{enemyKey:"ghost",w:10},{enemyKey:"zombie",w:12},{enemyKey:"spider",w:7},{enemyKey:"rain",w:5},{enemyKey:"skull",w:5}]},
    {min:9,max:12,pool:[{enemyKey:"wolf",w:24},{enemyKey:"lion",w:26},{enemyKey:"dragon",w:10},{enemyKey:"ghost",w:8},{enemyKey:"zombie",w:14},{enemyKey:"spider",w:8},{enemyKey:"rain",w:6},{enemyKey:"skull",w:4}]},
    {min:13,max:15,pool:[
      {enemyKey:"lion",w:24},
      {enemyKey:"dragon",w:12},
      {enemyKey:"ghost",w:8},
      {enemyKey:"zombie",w:14},
      {enemyKey:"spider",w:10},
      {enemyKey:"rain",w:8},
      {enemyKey:"skull",w:10},
      {enemyKey:"chick",w:2}
    ]},
    {min:16,max:999,pool:[
      {enemyKey:"lion",w:22},
      {enemyKey:"dragon",w:14},
      {enemyKey:"ghost",w:7},
      {enemyKey:"zombie",w:12},
      {enemyKey:"spider",w:8},
      {enemyKey:"rain",w:7},
      {enemyKey:"skull",w:14},
      {enemyKey:"invader",w:8},
      {enemyKey:"chick",w:2}
    ]}
  ];

  window.GAME_DATA = {
    SPRITES,
    ENEMY_DEFS,
    ITEM_DEFS,
    DROP_MODE,
    DROP_PROFILES,
    FLOOR_ITEM_RULE,
    ENEMY_DROP_CHANCE,
    ENEMY_DEFAULT_DROP_RULE,
    CHEST_DROP_RULE,
    STARTER_DROP_RULE,
    FLOOR_ENEMY_TABLES,
    itemDefByKey,
    itemDefById,
    itemKeyFromDropEntry,
    enemyDefByKey,
    enemyDefById,
    enemyDefFromInstance,
    buildEmptyKillMap,
    enemyDropRule
  };
})();
