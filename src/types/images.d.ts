declare module "*.jpg" { const src: string; export default src; }
declare module "*.png" { const src: string; export default src; }
declare module "*.webp" { const src: string; export default src; }
import img01 from "./assets/gallery/01.jpg";
import img02 from "./assets/gallery/02.jpg";
import img03 from "./assets/gallery/03.jpg";
import img04 from "./assets/gallery/04.jpg";
import img05 from "./assets/gallery/05.jpg";
import img06 from "./assets/gallery/06.jpg";
import img07 from "./assets/gallery/07.jpg";
import img08 from "./assets/gallery/08.jpg";

const galleryImages: { src: string; alt: string }[] = [
  { src: img01, alt: "Санузел — керамогранит, душевая зона" },
  { src: img02, alt: "Фартук кухни — белый кабанчик" },
  { src: img03, alt: "Пол — керамогранит под бетон" },
  { src: img04, alt: "Санузел — мозаика и ниши" },
  { src: img05, alt: "Кухня — фартук и столешница" },
  { src: img06, alt: "Пол — крупный формат 60×120" },
  { src: img07, alt: "Декоративные швы и примыкания" },
  { src: img08, alt: "Душ — линейный трап, стекло" },
];
