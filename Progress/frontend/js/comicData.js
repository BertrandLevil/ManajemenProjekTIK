import { comics as defaultComics } from "./data.js";

export function getAllComics() {
    let savedComics = [];

    try {
        savedComics = JSON.parse(
            localStorage.getItem("comicid_creator_comics") || "[]"
        );

        if (!Array.isArray(savedComics)) {
            savedComics = [];
        }
    } catch (error) {
        console.error("Gagal membaca komik kreator:", error);
    }

    const savedMap = new Map(
        savedComics.map(comic => [Number(comic.id), comic])
    );

    const allComics = defaultComics.map(comic => {
        return savedMap.get(Number(comic.id)) || { ...comic };
    });

    savedComics.forEach(savedComic => {
        const alreadyExists = allComics.some(
            comic => Number(comic.id) === Number(savedComic.id)
        );

        if (!alreadyExists) {
            allComics.push(savedComic);
        }
    });

    return allComics;
}

// Sinkronisasi data komik dari backend API secara otomatis
if (typeof window !== "undefined" && typeof fetch === "function") {
    fetch("/api/comics")
        .then(res => res.json())
        .then(res => {
            if (res && res.success && Array.isArray(res.data)) {
                let savedComics = [];
                try {
                    savedComics = JSON.parse(
                        localStorage.getItem("comicid_creator_comics") || "[]"
                    );
                } catch {
                    savedComics = [];
                }
                let changed = false;
                res.data.forEach(item => {
                    const cId = Number(item.id || item.id_komik);
                    const exists = defaultComics.some(c => Number(c.id) === cId) ||
                                   savedComics.some(c => Number(c.id) === cId);
                    if (!exists) {
                        savedComics.push({
                            id: cId,
                            creatorId: Number(item.creator_id || item.id_kreator),
                            title: item.title || item.nama_komik,
                            author: item.creator_name || "Kreator",
                            studio: [item.studio || "-"],
                            category: item.categories?.[0] || "Manhwa",
                            genre: item.categories || ["Action"],
                            description: item.description || item.deskripsi || "",
                            chapter: item.total_chapters || 0,
                            rating: item.rating || 0.0,
                            cover: "../assets/coverComic/Solev.jpg"
                        });
                        changed = true;
                    }
                });
                if (changed) {
                    localStorage.setItem("comicid_creator_comics", JSON.stringify(savedComics));
                }
            }
        })
        .catch(err => {
            console.warn("[ComicData Sync] Backend offline:", err);
        });
}
