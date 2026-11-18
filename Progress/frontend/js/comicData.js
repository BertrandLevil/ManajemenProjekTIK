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
