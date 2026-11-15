export const DEFAULT_MENU = {
  version: 1,
  updatedAt: null,
  categories: [
    {
      id: "kahve",
      name: "Kahve",
      icon: "☕",
      description: "Günün her saatine eşlik eden kahve molası",
      items: [
        { id: "espresso", name: "Espresso", price: 120, visible: true },
        { id: "americano", name: "Americano", price: 150, visible: true },
        { id: "latte", name: "Latte", price: 170, visible: true },
        { id: "flat-white", name: "Flat White", price: 170, visible: true },
        { id: "cappuccino", name: "Cappuccino", price: 170, visible: true },
        { id: "cortado", name: "Cortado", price: 170, visible: true },
        { id: "vanilla-latte", name: "Vanilya Latte", price: 195, visible: true },
        { id: "caramel-latte", name: "Caramel Latte", price: 195, visible: true },
        { id: "salted-caramel-latte", name: "Salted Caramel Latte", price: 195, visible: true },
        { id: "strawberry-latte", name: "Strawberry Latte", price: 210, visible: true },
        { id: "lotus-latte", name: "Lotus Latte", price: 220, visible: true },
        { id: "dulce-latte", name: "Dulce Latte", price: 220, visible: true },
        { id: "mocha", name: "Mocha", price: 200, visible: true },
        { id: "white-chocolate-mocha", name: "White Chocolate Mocha", price: 200, visible: true },
        { id: "turk-kahvesi", name: "Türk Kahvesi", price: 100, visible: true },
        { id: "double-turk-kahvesi", name: "Double Türk Kahvesi", price: 130, visible: true },
        { id: "sicak-cikolata", name: "Sıcak Çikolata", price: 210, visible: true },
        { id: "salep", name: "Salep", price: 180, visible: true },
        { id: "chai-tea-latte", name: "Chai Tea Latte", price: 180, visible: true }
      ],
      notes: [
        { id: "bitkisel-sut", name: "Ekstra bitkisel süt (yulaf, badem, soya)", price: 55 },
        { id: "bitkisel-surup", name: "Ekstra bitkisel şurup", price: 25 }
      ]
    },
    {
      id: "cay",
      name: "Çay",
      icon: "🫖",
      description: "Demlikten fincana, sıcacık bir mola",
      items: [
        { id: "cay", name: "Çay", price: 35, visible: true },
        { id: "fincan-cay", name: "Fincan Çay", price: 50, visible: true },
        { id: "nane-limon-cayi", name: "Nane Limon Çayı", price: 120, visible: true },
        { id: "yesil-cay", name: "Yeşil Çay", price: 120, visible: true },
        { id: "papatya-cayi", name: "Papatya Çayı", price: 120, visible: true },
        { id: "ihlamur", name: "Ihlamur", price: 120, visible: true }
      ]
    },
    {
      id: "soguk-icecekler",
      name: "Soğuk İçecekler",
      icon: "🧊",
      description: "Serinleten favoriler",
      items: [
        { id: "ice-americano", name: "Ice Americano", price: 170, visible: true },
        { id: "iced-latte", name: "Iced Latte", price: 190, visible: true },
        { id: "iced-caramel-latte", name: "Iced Caramel Latte", price: 215, visible: true },
        { id: "iced-vanilla-latte", name: "Iced Vanilla Latte", price: 215, visible: true },
        { id: "iced-strawberry-latte", name: "Iced Strawberry Latte", price: 230, visible: true },
        { id: "iced-lotus-latte", name: "Iced Lotus Latte", price: 230, visible: true },
        { id: "iced-dulce-latte", name: "Iced Dulce Latte", price: 230, visible: true },
        { id: "iced-mocha", name: "Iced Mocha", price: 210, visible: true },
        { id: "iced-white-mocha", name: "Iced White Mocha", price: 210, visible: true },
        { id: "limonata", name: "Limonata", price: 150, visible: true },
        { id: "cilekli-limonata", name: "Çilekli Limonata", price: 180, visible: true },
        { id: "cool-lime", name: "Cool Lime", price: 180, visible: true },
        { id: "berry-hibiskus", name: "Berry Hibiskus", price: 180, visible: true },
        { id: "milkshake", name: "Milkshake", price: 250, visible: true }
      ]
    },
    {
      id: "soft-icecekler",
      name: "Soft İçecekler",
      icon: "🥤",
      description: "Klasik ve ferah seçenekler",
      items: [
        { id: "su", name: "Su", price: 40, visible: true },
        { id: "mineralli-su", name: "Mineralli Su", price: 60, visible: true },
        { id: "redbull-limon", name: "Redbull + Limon", price: 120, visible: true },
        { id: "churchill", name: "Churchill", price: 90, visible: true }
      ]
    },
    {
      id: "matcha",
      name: "Matcha",
      icon: "🍵",
      description: "Matcha sevenlere özel",
      items: [
        { id: "matcha-latte", name: "Matcha Latte", price: 210, visible: true },
        { id: "vanilya-matcha-latte", name: "Vanilya Matcha Latte", price: 240, visible: true },
        { id: "strawberry-matcha-latte", name: "Strawberry Matcha Latte", price: 240, visible: true },
        { id: "blueberry-matcha-latte", name: "Blueberry Matcha Latte", price: 240, visible: true }
      ]
    }
  ]
};

export function cloneDefaultMenu() {
  return JSON.parse(JSON.stringify(DEFAULT_MENU));
}
