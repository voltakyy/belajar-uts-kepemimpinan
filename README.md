# UTS Kepemimpinan & Komunikasi Interpersonal — UMS

Situs belajar untuk persiapan **Ujian Tengah Semester** mata kuliah
*Kepemimpinan dan Komunikasi Interpersonal* (TIF3221206, 2 SKS),
Program Studi Informatika, Fakultas Komunikasi dan Informatika,
Universitas Muhammadiyah Surakarta.

**Buka situsnya:** https://voltakyy.github.io/belajar-uts-kepemimpinan/

---

## Kenapa situs ini dibuat

Dua paket soal UTS yang diarsipkan (2024/2025 dan 2025/2026) ternyata
memiliki pola yang sangat stabil: **4 soal esai × 25 poin, 90 menit, close book**.
Yang berubah hanya arena penerapannya. Situs ini membedah keduanya dan
menyertakan definisi yang dikutip langsung dari materi kuliah dosen — bukan
dari buku lain — supaya jawaban tetap berada di dalam batas materi yang diajarkan.

## Isi

| Halaman | Isi |
|---|---|
| `index.html` | Beranda, peta UTS berdasarkan RPS, bank definisi 6 materi, glosarium 28 istilah, 12 flashcard |
| `uts-2024.html` | 4 soal UTS 2024/2025 + model jawaban, rubrik, jebakan, simulasi 90 menit |
| `uts-2025.html` | 4 soal UTS 2025/2026 + model jawaban, rubrik, jebakan, simulasi 90 menit, perbandingan antar tahun |

### Halaman UTS 2024/2025

Penekanan: organisasi kemahasiswaan dan pengembangan tim.
Soal nomor 2 (aqidah–akhlak dalam konflik) dan nomor 4 (cara meningkatkan
keterampilan + bukti) juga muncul di tahun berikutnya.

### Halaman UTS 2025/2026

Penekanan bergeser: memimpin diri sendiri (disiplin, mandiri, juang),
konflik pada kehidupan bermasyarakat dan bernegara, profesionalisme di
ormawa, serta keterampilan kepemimpinan dalam tim multidisiplin.

## Batas materi

RPS menempatkan UTS pada **pertemuan 8**, sehingga cakupannya pertemuan 1–7:

| # | Materi | Berkas | Bobot |
|---|---|---|---|
| 1 | Konsep dasar kepemimpinan | `KKI_Materi1` | 6% |
| 2 | Aqidah dan Kepemimpinan | `KKI_Materi2` | 7% |
| 3 | Akhlaq kepemimpinan | `KKI_Materi3` | 7% |
| 4 | Tantangan Kepemimpinan | `KKI_Materi5` (Tantangan) | 6% |
| 5 | Skill/Kecakapan Kepemimpinan | `KKI_Materi5` (Skill) | 6% |
| 6 | Cara meningkatkan skill kepemimpinan | `KKI_Materi67` | 8% |
| 7 | Konsep dasar komunikasi (umum) | — (belum ada slide) | 8% |

Komunikasi interpersonal (pertemuan 9–14) adalah wilayah **UAS**, bukan UTS.
Itu sebabnya tidak ada pembahasan teori komunikasi interpersonal di sini —
dan memang tidak ada satu pun butir soal UTS 2024 maupun 2025 yang menanyakannya.

## Cara pakai

1. Buka halaman tahun yang ingin dilatih.
2. Tekan **Mulai** pada simulasi, kerjakan 4 soal dalam 90 menit.
3. Bandingkan dengan model jawaban, lalu isi nilai mandiri memakai rubrik.
4. Ulangi halaman satunya, lalu baca bagian **2024 vs 2025** untuk melihat
   pergeseran arena soal.

Jawaban dan nilai tersimpan di `localStorage` peramban — tidak ada akun,
tidak ada data yang dikirim ke mana pun.

## Teknis

- HTML + CSS + JavaScript murni. **Tanpa build tool, tanpa dependensi, tanpa CDN.**
- Tema terang/gelap mengikuti preferensi sistem, bisa diganti manual.
- Siap dicetak (Ctrl+P) untuk belajar offline; navigasi dan tombol disembunyikan
  saat mencetak.
- `prefers-reduced-motion` dihormati.

```text
belajar-uts-kepemimpinan/
├── index.html          beranda + peta UTS + materi + glosarium + flashcard
├── uts-2024.html       paket soal 2024/2025
├── uts-2025.html       paket soal 2025/2026
├── styles.css          sistem desain (satu berkas untuk semua halaman)
├── app.js              tema, navigasi, glosarium, flashcard, simulator
├── .nojekyll           agar GitHub Pages tidak memproses lewat Jekyll
└── README.md
```

## Menjalankan secara lokal

```powershell
python -m http.server 8000
# lalu buka http://localhost:8000
```

Cukup membuka `index.html` langsung di peramban juga bisa.

## Sumber

- Materi kuliah pertemuan 1–7 (PDF) — Nurgiyatna, S.T., M.Sc., Ph.D.
- Arsip soal UTS Gasal 2024/2025 (Selasa, 29 Oktober 2024) dan
  2025/2026 (Selasa, 28 Oktober 2025) — penguji Azizah Fatmawati, M.Sc., S.T.
  dan Maryam, S.Kom., M.Eng.
- RPS mata kuliah (disusun 9 Desember 2024).

> Catatan: jawaban di situs ini adalah **model jawaban** yang disusun dari
> materi kuliah, bukan kunci resmi dosen. Gunakan sebagai pembanding, bukan
> pengganti pemahaman.
