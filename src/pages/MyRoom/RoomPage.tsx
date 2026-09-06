import { ArrowLeft, Check, Coins, ShoppingBag } from "lucide-react";
import { findFurniture, furnitureItems } from "@/src/data/room/furniture";
import type { AppState, RoomSlot } from "@/src/models";

interface Props {
  state: AppState;
  message: string;
  onHome: () => void;
  onItem: (itemId: string) => void;
}

export function RoomPage({ state, message, onHome, onItem }: Props) {
  const equipped = (slot: RoomSlot) => {
    const id = state.room.equippedItems[slot];
    return id ? findFurniture(id) : undefined;
  };
  const bed = equipped("bed");
  const desk = equipped("desk");
  const floor = equipped("floor");
  const corner = equipped("corner");
  const pet = equipped("pet");
  const wall = equipped("wall");

  return (
    <main className="room-page">
      <div className="simple-page-nav">
        <button onClick={onHome}><ArrowLeft />返回小岛</button>
        <strong>🏠 我的房间</strong>
        <span className="room-coins"><Coins />{state.rewards.coins}</span>
      </div>
      <section className="room-scene" aria-label="我的卡通房间">
        <div className="room-window"><span>☁️</span><span>☀️</span></div>
        <div className="room-wall"><h1>我的快乐小屋</h1>{wall && <span className="wall-item" title={wall.name}>{wall.emoji}</span>}</div>
        {bed && <div className="bed" title={bed.name}>{bed.emoji}</div>}
        {desk && <div className="desk" title={desk.name}>🪴 <span>{desk.emoji}</span></div>}
        {floor && <div className="rug" title={floor.name}>{floor.emoji}</div>}
        {corner && <div className="corner-item" title={corner.name}>{corner.emoji}</div>}
        {pet && <div className="pet-item" title={pet.name}>{pet.emoji}</div>}
        <p>{message}</p>
      </section>

      <section className="furniture-drawer">
        <div className="drawer-heading"><div><span>家具小箱子</span><h2>选一个放进房间</h2></div><ShoppingBag /></div>
        <div className="furniture-grid">
          {furnitureItems.filter((item) => item.price > 0).map((item) => {
            const owned = state.room.unlockedItems.includes(item.id);
            const active = state.room.equippedItems[item.slot] === item.id;
            return (
              <button key={item.id} className={`${owned ? "owned" : "locked"} ${active ? "active" : ""}`} onClick={() => onItem(item.id)} disabled={active}>
                <span>{item.emoji}</span>
                <strong>{item.name}</strong>
                <small>{item.description}</small>
                <b>{active ? <><Check />使用中</> : owned ? "换上" : <><Coins />{item.price}</>}</b>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
