# Gambar peribadi ending

Gambar ending sudah dijana daripada foto sebenar Faris/Qish dan doodle Qish:

- Kad 9: `game/public/assets/ending/couple-comic.webp`.
- Tamat: `game/public/assets/ending/ensemble-comic.webp`, enam watak dan ruang tengah kosong.
- Memori “Mula-mula kawan”: `game/public/assets/ending/memory-friends.webp`.

Sumber serta prompt lengkap: `art/ending-comic-2026-10-27/README.md`
(versi sebelumnya di `art/ending-qc-2026-10-27/README.md`).
Eksport semula: `python3 pipeline/tools/ending_qc_assets.py`.

Untuk menggantikan dengan pilihan sendiri kemudian, letak `ref/kad-rahsia.png` atau
`ref/tamat.png` (JPG/JPEG/WebP juga diterima; satu versi bagi setiap nama).
Kad mengekalkan bingkai/nama/move. Tamat menggunakan seluruh gambar sebagai latar tanpa crop,
dengan teks di tengah; pastikan bahagian tengah gambar kosong.
Jalankan `cd game && npm run build` untuk kemas kini production port 5180.
