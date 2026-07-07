export function HandbookPage() {
  return (
    <section className="handbook-page" aria-label="Handbook">
      <article className="handbook-section">
        <h2>Basics</h2>
        <p>
          Earn RAP, train Skills, unlock Collectibles, and run Activities to fill your Codex over time.
        </p>
      </article>
      <article className="handbook-section">
        <h2>RAP</h2>
        <p>
          RAP means Real Life Activity Points. RAP is spent on Skill training, direct Collectible unlocks, and repeatable Activities.
        </p>
      </article>
      <article className="handbook-section">
        <h2>Skills</h2>
        <p>
          Skills use RuneScape-style XP and can reach Level 120. Skill levels unlock Collectibles and Activities.
        </p>
      </article>
      <article className="handbook-section">
        <h2>Activities</h2>
        <p>
          Activities cost RAP, run for a set duration, then award XP and roll their Drop Table. Skill levels above the minimum can improve Activity XP, RAP cost, and runtime by up to 15%.
        </p>
      </article>
      <article className="handbook-section">
        <h2>Tools</h2>
        <p>
          Tools are permanent Collectibles. Some are bought with RAP, while rare Tools can drop from Activities. Owned Tools can grant Account Bonuses such as extra Skill XP.
        </p>
      </article>
      <article className="handbook-section">
        <h2>Account Bonuses</h2>
        <p>
          Account Bonuses are always-on rewards from owned Collectibles. The first bonuses are simple Skill XP bonuses and a rare Additional Roll chance.
        </p>
      </article>
      <article className="handbook-section">
        <h2>Drops</h2>
        <p>
          Every unowned drop in an Activity table is rolled when the Activity finishes. A run can award at most one Collectible. If multiple rolls succeed, the rarest successful drop is awarded.
        </p>
      </article>
      <article className="handbook-section">
        <h2>Additional Roll</h2>
        <p>
          Additional Roll chance can create one extra Activity drop roll after the normal roll. It is shown in the Activity result panel when a run finishes.
        </p>
      </article>
      <article className="handbook-section">
        <h2>Bad Luck Protection</h2>
        <p>
          When completed runs reach twice a drop's base denominator, that drop's chance is tripled. Example: a 1 / 500 drop becomes 3 / 500 at 1,000 runs.
        </p>
      </article>
      <article className="handbook-section">
        <h2>Codex States</h2>
        <ul>
          <li>Green means owned.</li>
          <li>Yellow means requirements are met, but RAP may still be needed.</li>
          <li>Red means locked or not yet obtained.</li>
          <li>Indigo marks Activity-drop Collectibles.</li>
        </ul>
      </article>
    </section>
  );
}
