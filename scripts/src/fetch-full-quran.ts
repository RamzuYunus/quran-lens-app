import { db, versesTable } from "@workspace/db";

/**
 * Fetch the complete Quran from alquran-api.pages.dev and save to local PostgreSQL.
 * This populates the database with all 114 surahs and 6,236 verses for offline use.
 */

interface QuranVerse {
  surah: number;
  ayah: number;
  text: string;
  surahName: string;
}

interface ApiVerse {
  number: number;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
  };
  ayah: number;
  text: string;
}

async function fetchSurah(surahNumber: number): Promise<QuranVerse[]> {
  const apiUrl = `https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      data?: {
        number: number;
        name: string;
        ayahs: ApiVerse[];
      };
    };

    if (!data.data) {
      throw new Error("Invalid API response structure");
    }

    const { data: surahData } = data;

    return surahData.ayahs.map((verse: ApiVerse) => ({
      surah: surahData.number,
      ayah: verse.ayah,
      text: verse.text,
      surahName: surahData.name,
    }));
  } catch (err) {
    console.error(`Failed to fetch surah ${surahNumber}:`, err instanceof Error ? err.message : String(err));
    return [];
  }
}

async function main() {
  console.log("🕋 Fetching complete Quran from alquran-api.pages.dev...");
  console.log("This may take 2-5 minutes depending on your internet speed.\n");

  let totalInserted = 0;
  let totalErrors = 0;

  // Fetch all 114 surahs
  for (let surahNum = 1; surahNum <= 114; surahNum++) {
    try {
      process.stdout.write(`Fetching surah ${surahNum}/114... `);

      const verses = await fetchSurah(surahNum);

      if (verses.length === 0) {
        console.log("⚠️  No verses found");
        totalErrors++;
        continue;
      }

      // Insert verses into database
      for (const verse of verses) {
        await db
          .insert(versesTable)
          .values({
            surah: verse.surah,
            ayah: verse.ayah,
            arabic: verse.text,
            surahName: verse.surahName,
          })
          .onConflictDoNothing();
      }

      totalInserted += verses.length;
      console.log(`✅ ${verses.length} verses`);

      // Rate limiting: 100ms delay between requests to be respectful to the API
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (err) {
      console.log(`❌ Error`);
      totalErrors++;
    }
  }

  console.log("\n✨ Complete!");
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Total verses inserted: ${totalInserted}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  if (totalInserted > 6000) {
    console.log("\n🎉 Successfully downloaded the complete Quran!");
    console.log("All verses are now stored in your local PostgreSQL database.");
    console.log("You can use the app completely offline.\n");
  } else {
    console.log("\n⚠️  Fetch completed, but fewer verses than expected were inserted.");
    console.log("This may happen if the API was rate-limited or had issues.");
    console.log("You can try running this script again.\n");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
