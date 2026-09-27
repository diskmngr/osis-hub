import { mutation } from "./_generated/server";
import { DEFAULT_SETTINGS } from "./siteSettings";

/** Placeholder content, inserted once when the database is still empty. */
const SEED_MEMBERS = [
  {
    name: "Alya Rahmawati",
    position: "Ketua OSIS",
    description:
      "Memimpin program kerja dan mengoordinasikan seluruh divisi selama satu periode.",
    order: 0,
  },
  {
    name: "Bagas Pratama",
    position: "Wakil Ketua",
    description:
      "Mendampingi ketua dan bertanggung jawab atas kelancaran kegiatan harian.",
    order: 1,
  },
  {
    name: "Citra Lestari",
    position: "Sekretaris",
    description: "Mengelola administrasi, notulen rapat, dan arsip organisasi.",
    order: 2,
  },
  {
    name: "Dimas Nugroho",
    position: "Bendahara",
    description: "Menyusun anggaran dan mencatat seluruh arus kas kegiatan.",
    order: 3,
  },
  {
    name: "Eka Putri",
    position: "Divisi Minat & Bakat",
    description: "Merancang lomba dan ekstrakurikuler untuk mengasah potensi siswa.",
    order: 4,
  },
  {
    name: "Fajar Setiawan",
    position: "Divisi Sosial",
    description: "Menginisiasi kegiatan bakti sosial dan kepedulian lingkungan.",
    order: 5,
  },
  {
    name: "Gita Maharani",
    position: "Divisi Keagamaan",
    description:
      "Mengelola kegiatan rohani dan pembinaan akhlak seluruh siswa.",
    order: 6,
  },
  {
    name: "Hendra Wijaya",
    position: "Divisi Olahraga",
    description:
      "Mengatur jadwal latihan, kompetisi, dan sarana olahraga sekolah.",
    order: 7,
  },
  {
    name: "Intan Permata",
    position: "Divisi Seni & Budaya",
    description:
      "Menyiapkan pentas seni, dekorasi acara, dan pelestarian budaya daerah.",
    order: 8,
  },
  {
    name: "Joko Santoso",
    position: "Divisi Hubungan Masyarakat",
    description:
      "Menjembatani komunikasi organisasi dengan siswa, guru, dan pihak luar.",
    order: 9,
  },
  {
    name: "Kirana Dewi",
    position: "Divisi Kesehatan",
    description:
      "Mengampanyekan hidup sehat dan mendukung kegiatan UKS sekolah.",
    order: 10,
  },
  {
    name: "Lukman Hakim",
    position: "Divisi Teknologi Informasi",
    description:
      "Mengelola media sosial, dokumentasi, dan kebutuhan teknologi kegiatan.",
    order: 11,
  },
];

const SEED_ACTIVITIES = [
  {
    title: "Peringatan Hari Kemerdekaan",
    description:
      "Lomba antar kelas, upacara bendera, dan pentas seni untuk merayakan kemerdekaan.",
    date: "2026-08-17",
  },
  {
    title: "Bakti Sosial Akhir Tahun",
    description:
      "Penggalangan donasi dan kunjungan ke panti asuhan di sekitar lingkungan sekolah.",
    date: "2026-12-20",
  },
  {
    title: "Pekan Olahraga & Seni",
    description:
      "Ajang kompetisi olahraga dan pertunjukan seni antar kelas selama satu pekan.",
    date: "2026-10-05",
  },
];

/**
 * Seed readers bump this when placeholder content is extended so existing
 * databases are topped up exactly once, without resurrecting deleted rows.
 */
const SEED_VERSION = 2;

/** Seeds placeholder content once so the public page is never empty. */
export const ensureData = mutation({
  args: {},
  handler: async (ctx) => {
    const existingMembers = await ctx.db.query("members").collect();
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "site"))
      .unique();

    if (existingMembers.length === 0) {
      for (const member of SEED_MEMBERS) await ctx.db.insert("members", member);
    } else {
      const version = settings?.seedVersion ?? 1;
      if (version < SEED_VERSION) {
        const names = new Set(existingMembers.map((m) => m.name));
        // Only insert the members added after the previous seed version.
        for (const member of SEED_MEMBERS.filter((m) => m.order >= 6)) {
          if (!names.has(member.name)) await ctx.db.insert("members", member);
        }
      }
    }

    if ((await ctx.db.query("activities").collect()).length === 0) {
      for (const activity of SEED_ACTIVITIES) await ctx.db.insert("activities", activity);
    }

    if (!settings) {
      await ctx.db.insert("siteSettings", {
        key: "site",
        ...DEFAULT_SETTINGS,
        seedVersion: SEED_VERSION,
      });
    } else if ((settings.seedVersion ?? 1) < SEED_VERSION) {
      await ctx.db.patch(settings._id, { seedVersion: SEED_VERSION });
    }
  },
});
