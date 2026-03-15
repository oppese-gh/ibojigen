"use strict";

const ENDING_CREDITS_TEXT = `🧔BOJIROGUE🧔

🦁Game Design🦁
Masaki / Mia (ChatGPT)

🗡️Programming🗡️
OpenAI Codex

🛡️Assistant Programming🛡️
Masaki / Mia (ChatGPT)

🧪Game Balance🧪
Masaki

📜Text & Scenario📜
Masaki / Mia (ChatGPT)

🌟AI Tools🌟
ChatGPT / Codex

⛰️Planning Support⛰️
Mia (ChatGPT)

🌋Director / Producer🌋
Masaki

💎Special Thanks💎
Players

🐕制作・著作🍖
Bojigen`;

function endingKillsText(){
  return ENEMY_DEFS
    .filter((def)=>(state.kills[def.key]||0) > 0)
    .map((def)=>`${def.char} ${state.kills[def.key]}`)
    .join("\n");
}

function renderEndingOverlay(){
  if(!endingOverlayEl || !endingContentEl) return;
  endingOverlayEl.classList.toggle("show", state.endingVisible);
  endingOverlayEl.setAttribute("aria-hidden", state.endingVisible ? "false" : "true");
  if(!state.endingVisible){
    endingContentEl.innerHTML = "";
    return;
  }
  if(state.endingPhase === "fade") endingContentEl.innerHTML = "";
  else if(state.endingPhase === "title") endingContentEl.innerHTML = `<div class="ending-title">ぼじろーぐ 完</div>`;
  else if(state.endingPhase === "credits") endingContentEl.innerHTML = `<div class="ending-credits-wrap"><div class="ending-credits-roll">${ENDING_CREDITS_TEXT}</div></div>`;
  else if(state.endingPhase === "stats"){
    const kills = endingKillsText();
    endingContentEl.innerHTML = `<div class="ending-stats">FINAL SCORE

SCORE   ${state.score}
BEST    ${bestScoreDisplayWithName()}
FLOOR   ${state.floor}
LEVEL   ${state.player.level}
TURNS   ${state.turns}

KILLS
${kills || "なし"}</div>`;
  }else if(state.endingPhase === "thanks"){
    endingContentEl.innerHTML = `<div class="ending-thanks">THANK YOU FOR PLAYING!</div>${state.endingReturnPromptVisible ? '<div class="ending-return-prompt">Rを押すとタイトル画面にもどります</div>' : ""}`;
  }else if(state.endingPhase === "returnName"){
    const starClass = state.endingReturnStarVisible ? "ending-return-star show" : "ending-return-star";
    endingContentEl.innerHTML = `<div class="ending-return-name-wrap"><span class="${starClass}">⭐️</span><span class="ending-return-name">${playerName()}</span></div>`;
  }
}

async function startEndingReturnSequence(){
  if(!state.gameClear || state.endingPhase !== "thanks" || !state.endingReturnReady || state.endingReturnStarted) return;
  state.endingReturnStarted = true;
  state.inputLocked = true;
  state.endingPhase = "returnName";
  state.endingReturnStarVisible = false;
  render();
  await sleep(1000);
  if(!state.endingReturnStarted) return;
  state.endingReturnStarVisible = true;
  render();
  await sleep(2000);
  if(!state.endingReturnStarted) return;
  restartGame();
}

async function endAsGameClear(){
  if(state.endingStarted) return;
  state.endingStarted = true;
  state.gameClear = true;
  state.inputLocked = true;
  addLog("ぼじろーぐ クリア！");
  playSe("clear");
  finalizeScore("GAME CLEAR");
  addLog("Rで再スタート");
  state.endingVisible = true;
  state.endingPhase = "fade";
  state.endingReturnPromptVisible = false;
  state.endingReturnReady = false;
  state.endingReturnStarted = false;
  state.endingReturnStarVisible = false;
  render();
  await sleep(1800);
  if(!state.endingStarted) return;
  state.endingPhase = "title";
  render();
  await sleep(2200);
  if(!state.endingStarted) return;
  state.endingPhase = "credits";
  render();
  await sleep(15500);
  if(!state.endingStarted) return;
  state.endingPhase = "stats";
  render();
  await sleep(5000);
  if(!state.endingStarted) return;
  state.endingPhase = "thanks";
  render();
  await sleep(3000);
  if(!state.endingStarted || state.endingPhase !== "thanks") return;
  state.endingReturnPromptVisible = true;
  state.endingReturnReady = true;
  state.inputLocked = false;
  render();
}
