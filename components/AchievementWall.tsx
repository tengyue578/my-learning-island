import { Award, LockKeyhole, Sparkles } from "lucide-react";
import { BADGES } from "@/lib/learning";

export function AchievementWall({ unlocked }: { unlocked: string[] }) {
  return (
    <section className="achievement-section" aria-labelledby="achievement-heading">
      <div className="section-title-row">
        <div><span className="eyebrow">小小荣誉室</span><h2 id="achievement-heading">成就徽章墙</h2></div>
        <Sparkles className="section-sparkle" aria-hidden="true" />
      </div>
      <div className="badge-grid">
        {BADGES.map((badge, index) => {
          const isUnlocked = unlocked.includes(badge.id);
          return (
            <article className={`badge-card candy-${index + 1} ${isUnlocked ? "unlocked" : "locked"}`} key={badge.id}>
              <div className="badge-medal">{isUnlocked ? <Award size={30} /> : <LockKeyhole size={24} />}</div>
              <div><h3>{badge.name}</h3><p>{badge.description}</p></div>
              <span>{isUnlocked ? "已获得" : "继续加油"}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
