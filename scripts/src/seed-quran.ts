import { db, versesTable, lensRulesTable } from "@workspace/db";

const VERSES = [
  { surah: 1, ayah: 1, arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", surahName: "Al-Fatihah" },
  { surah: 1, ayah: 2, arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", surahName: "Al-Fatihah" },
  { surah: 1, ayah: 3, arabic: "الرَّحْمَٰنِ الرَّحِيمِ", surahName: "Al-Fatihah" },
  { surah: 1, ayah: 4, arabic: "مَالِكِ يَوْمِ الدِّينِ", surahName: "Al-Fatihah" },
  { surah: 1, ayah: 5, arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", surahName: "Al-Fatihah" },
  { surah: 1, ayah: 6, arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", surahName: "Al-Fatihah" },
  { surah: 1, ayah: 7, arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", surahName: "Al-Fatihah" },

  { surah: 2, ayah: 1, arabic: "الم", surahName: "Al-Baqarah" },
  { surah: 2, ayah: 2, arabic: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ", surahName: "Al-Baqarah" },
  { surah: 2, ayah: 3, arabic: "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ", surahName: "Al-Baqarah" },
  { surah: 2, ayah: 4, arabic: "وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ وَبِالْآخِرَةِ هُمْ يُوقِنُونَ", surahName: "Al-Baqarah" },
  { surah: 2, ayah: 5, arabic: "أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ", surahName: "Al-Baqarah" },
  { surah: 2, ayah: 30, arabic: "وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً قَالُوا أَتَجْعَلُ فِيهَا مَن يُفْسِدُ فِيهَا وَيَسْفِكُ الدِّمَاءَ وَنَحْنُ نُسَبِّحُ بِحَمْدِكَ وَنُقَدِّسُ لَكَ قَالَ إِنِّي أَعْلَمُ مَا لَا تَعْلَمُونَ", surahName: "Al-Baqarah" },
  { surah: 2, ayah: 255, arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ", surahName: "Al-Baqarah" },

  { surah: 112, ayah: 1, arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ", surahName: "Al-Ikhlas" },
  { surah: 112, ayah: 2, arabic: "اللَّهُ الصَّمَدُ", surahName: "Al-Ikhlas" },
  { surah: 112, ayah: 3, arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ", surahName: "Al-Ikhlas" },
  { surah: 112, ayah: 4, arabic: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", surahName: "Al-Ikhlas" },

  { surah: 113, ayah: 1, arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", surahName: "Al-Falaq" },
  { surah: 113, ayah: 2, arabic: "مِن شَرِّ مَا خَلَقَ", surahName: "Al-Falaq" },
  { surah: 113, ayah: 3, arabic: "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ", surahName: "Al-Falaq" },
  { surah: 113, ayah: 4, arabic: "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ", surahName: "Al-Falaq" },
  { surah: 113, ayah: 5, arabic: "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ", surahName: "Al-Falaq" },

  { surah: 114, ayah: 1, arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", surahName: "An-Nas" },
  { surah: 114, ayah: 2, arabic: "مَلِكِ النَّاسِ", surahName: "An-Nas" },
  { surah: 114, ayah: 3, arabic: "إِلَٰهِ النَّاسِ", surahName: "An-Nas" },
  { surah: 114, ayah: 4, arabic: "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ", surahName: "An-Nas" },
  { surah: 114, ayah: 5, arabic: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ", surahName: "An-Nas" },
  { surah: 114, ayah: 6, arabic: "مِنَ الْجِنَّةِ وَالنَّاسِ", surahName: "An-Nas" },
];

const LENSES = [
  {
    name: "quantum_coherence",
    description: "Interprets Quranic concepts through the lens of quantum field theory and modern physics",
    rules: `LENS: Quantum Field Coherence
DESCRIPTION: Reframe Quranic terms using concepts from quantum field theory, coherence, and the physics of information.

This lens interprets the Quran as a description of the deep structure of reality through the language of quantum physics. Classical Arabic roots are traced to their pre-Islamic meanings to reveal connections with modern physics.

KEY PRINCIPLES:
- Use quantum physics terminology naturally and accurately
- Treat spiritual concepts as descriptions of physical realities at the quantum scale
- Maintain the depth and gravitas of the original text`,
    glossary: [
      { term: "Allah (الله)", translation: "The Omnipresent Quantum Field / Unified Field of Consciousness", notes: "From root 'ilah' - the source and substrate of all existence" },
      { term: "Rabb (رب)", translation: "The Organizing Principle / Self-organizing Field Dynamics", notes: "From root r-b-b: nurturing, regulating, bringing to completion" },
      { term: "Mala'ikah (ملائكة)", translation: "Field Operators / Regulatory Quantum Patterns", notes: "Forces that mediate interactions between quantum states" },
      { term: "Jinn (جن)", translation: "Hidden Variables / Non-observable Quantum States", notes: "From j-n-n: concealment, the unseen" },
      { term: "Rahman (رحمن)", translation: "The Expansive Field / Universal Wave Function", notes: "The all-encompassing nature of quantum probability" },
      { term: "Rahim (رحيم)", translation: "The Coherence-restoring Force / Entanglement", notes: "The particular, local manifestation of quantum connection" },
      { term: "Salat (صلاة)", translation: "Quantum Alignment / Phase Synchronization", notes: "Coherent coupling between observer and field" },
      { term: "Iman (إيمان)", translation: "Coherent State Maintenance / Wavefunction Stability", notes: "Sustained phase relationship with the unified field" },
      { term: "Kufr (كفر)", translation: "Decoherence / Quantum Isolation", notes: "Breaking the phase relationship with the unified field" },
    ],
  },
  {
    name: "economics",
    description: "Reads the Quran as a treatise on economic systems, resource allocation, and social organization",
    rules: `LENS: Economic Science
DESCRIPTION: Interpret Quranic concepts through economic theory, resource allocation, incentive structures, and social organization.

This lens reads the Quran as a sophisticated economic text describing the principles of resource management, wealth distribution, and social coordination at multiple scales.

KEY PRINCIPLES:
- Use precise economic terminology (microeconomics, macroeconomics, game theory, institutional economics)
- Identify incentive structures and coordination mechanisms described
- Connect concepts to both classical and behavioral economics`,
    glossary: [
      { term: "Allah (الله)", translation: "The Market / Universal Allocator / Price Mechanism", notes: "The invisible hand that coordinates decentralized decision-making" },
      { term: "Rabb (رب)", translation: "The Regulator / Central Planner / Institutional Framework", notes: "The rules and norms that govern economic interaction" },
      { term: "Mala'ikah (ملائكة)", translation: "Economic Agents / Market Intermediaries", notes: "Entities that facilitate exchange and enforce contracts" },
      { term: "Rizq (رزق)", translation: "Resource Endowment / Factor Income", notes: "The economic resources allocated to each agent" },
      { term: "Zakat (زكاة)", translation: "Redistributive Tax / Pigouvian Transfer", notes: "Mechanism for correcting market failures and inequality" },
      { term: "Riba (ربا)", translation: "Rent-seeking / Unproductive Extraction", notes: "Economic rent without productive contribution" },
      { term: "Taqwa (تقوى)", translation: "Risk Aversion / Prudential Behavior", notes: "Decision-making under uncertainty with full cost internalization" },
      { term: "Adl (عدل)", translation: "Market Efficiency / Pareto Optimality", notes: "Outcomes where no further exchange can make someone better off" },
    ],
  },
];

async function main() {
  console.log("Seeding Quran verses...");

  for (const verse of VERSES) {
    await db
      .insert(versesTable)
      .values(verse)
      .onConflictDoNothing();
  }

  console.log(`Inserted ${VERSES.length} verses`);

  console.log("Seeding lens rules...");

  for (const lens of LENSES) {
    await db
      .insert(lensRulesTable)
      .values({
        name: lens.name,
        description: lens.description,
        rules: lens.rules,
        glossaryJson: JSON.stringify(lens.glossary),
      })
      .onConflictDoNothing();
  }

  console.log(`Inserted ${LENSES.length} lens configurations`);
  console.log("Seeding complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
