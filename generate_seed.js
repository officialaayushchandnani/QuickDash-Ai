
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, 'public', 'assets', 'products');
const outputFile = path.join(__dirname, 'server', 'controllers', 'seed.ts');

// Helper to determine category
function getCategory(name) {
    name = name.toLowerCase();
    if (name.includes('milk') || name.includes('cheese') || name.includes('butter') || name.includes('paneer') || name.includes('yogurt') || name.includes('curd')) return 'Dairy';
    if (name.includes('bread') || name.includes('cake') || name.includes('muffin') || name.includes('croissant') || name.includes('bun')) return 'Bakery';
    if (name.includes('apple') || name.includes('banana') || name.includes('orange') || name.includes('grape') || name.includes('mango') || name.includes('fruit')) return 'Fruits';
    if (name.includes('tomato') || name.includes('potato') || name.includes('onion') || name.includes('spinach') || name.includes('carrot') || name.includes('veg')) return 'Vegetables';
    if (name.includes('coca') || name.includes('pepsi') || name.includes('fanta') || name.includes('sprite') || name.includes('juice') || name.includes('drink') || name.includes('7up')) return 'Beverages';
    if (name.includes('rice') || name.includes('flour') || name.includes('oil') || name.includes('sugar') || name.includes('salt') || name.includes('wheat') || name.includes('grain')) return 'FoodGrains';
    if (name.includes('chips') || name.includes('maggi') || name.includes('noodle') || name.includes('snack') || name.includes('biscuit') || name.includes('cookie')) return 'Snacks';
    return 'Others';
}

// Helper to format name
function formatName(filename) {
    let name = filename.replace(/_image(_\d+)?\.(png|jpg|svg|jpeg)/i, '');
    name = name.replace(/_/g, ' ');
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Helper for price
function getPrice(category) {
    switch (category) {
        case 'Dairy': return 40 + Math.floor(Math.random() * 100);
        case 'Bakery': return 30 + Math.floor(Math.random() * 150);
        case 'Fruits': return 80 + Math.floor(Math.random() * 200);
        case 'Vegetables': return 20 + Math.floor(Math.random() * 60);
        case 'Beverages': return 40 + Math.floor(Math.random() * 100);
        case 'FoodGrains': return 60 + Math.floor(Math.random() * 300);
        case 'Snacks': return 10 + Math.floor(Math.random() * 50);
        default: return 50;
    }
}

const otherExports = `
export const demoCustomers = [
  { id: "1", name: "John Smith", email: "john@email.com", phone: "+91 98765 43210", orders: 24, totalSpent: 3250, joinDate: "2025-01-15", status: "Active", address: "123 Main Street, Satellite, Ahmedabad, Gujarat 380015", lastOrder: "2025-08-25", favoriteCategory: "Dairy", recentOrders: [{ id: "ORD001", date: "2025-08-25", amount: 145, status: "Delivered" }] },
  { id: "2", name: "Priya Patel", email: "priya@email.com", phone: "+91 98765 43211", orders: 18, totalSpent: 2890, joinDate: "2025-02-20", status: "Active", address: "456 Park Avenue, Vastrapur, Ahmedabad, Gujarat 380058", lastOrder: "2025-08-22", favoriteCategory: "Fruits", recentOrders: [{ id: "ORD004", date: "2025-08-22", amount: 160, status: "Delivered" }] },
  { id: "5", name: "Amit Shah", email: "amit@email.com", phone: "+91 98765 43214", orders: 45, totalSpent: 8940, joinDate: "2024-09-22", status: "VIP", address: "654 Prahlad Nagar, Ahmedabad, Gujarat 380015", lastOrder: "2025-08-28", favoriteCategory: "Beverages", recentOrders: [{ id: "ORD011", date: "2025-08-28", amount: 380, status: "Delivered" }] },
];
export const demoDeliveryAgents = [
  { id: '1', name: 'Jane Agent', email: 'jane@agent.com', phone: '+91 98765 43211', vehicleNumber: 'GJ-01-AB-1234', address: 'Agent Colony, Vastrapur, Ahmedabad', joinDate: '2025-01-10', status: 'Active', totalDeliveries: 156, rating: 4.8, earnings: 15600 },
  { id: '2', name: 'Rahul Kumar', email: 'rahul@agent.com', phone: '+91 98765 43212', vehicleNumber: 'GJ-01-CD-5678', address: 'Delivery Hub, Satellite, Ahmedabad', joinDate: '2025-02-15', status: 'Active', totalDeliveries: 98, rating: 4.6, earnings: 9800 },
];

export const ahmedabadZones = [
  { id: "1", name: "Satellite", area: "Satellite Road, Ahmedabad", deliveryTime: "10-20 mins", isActive: true, radius: "5 km", orders: 234 },
  { id: "2", name: "Vastrapur", area: "Vastrapur Lake Area, Ahmedabad", deliveryTime: "15-25 mins", isActive: true, radius: "4 km", orders: 189 },
  { id: "3", name: "Navrangpura", area: "C.G. Road, Navrangpura, Ahmedabad", deliveryTime: "12-22 mins", isActive: true, radius: "3 km", orders: 312 },
  { id: "4", name: "Bodakdev", area: "S.G. Highway, Bodakdev, Ahmedabad", deliveryTime: "15-30 mins", isActive: true, radius: "8 km", orders: 156 },
];
`;

try {
    const files = fs.readdirSync(assetsDir);
    const products = files.filter(f => f.match(/\.(png|jpg|jpeg|svg)$/) && f.includes('_image') && !f.includes('add_address')).map(file => {
        const name = formatName(file);
        const category = getCategory(name);
        const price = getPrice(category);

        return {
            name: name,
            price: price,
            image: `/assets/products/${file}`, // Path for frontend
            category: category,
            description: `Fresh and high quality ${name}. Sourced from the best suppliers.`,
            stock: 50 + Math.floor(Math.random() * 100),
            deliveryTime: "10-30 mins",
            rating: Number((4 + Math.random()).toFixed(1)), // Ensure definition matches number type
            reviews: Math.floor(Math.random() * 500),
            company: "QuickDash Select",
            size: "Standard",
            tags: [category.toLowerCase(), "fresh", "popular"]
        };
    });

    const fileContent = `export const demoProducts = ${JSON.stringify(products, null, 2)};

export const demoCategories = [
  { name: "Vegetables", image: "/assets/products/organic_vegitable_image.png" },
  { name: "Fruits", image: "/assets/products/fresh_fruits_image.png" },
  { name: "Beverages", image: "/assets/products/bottles_image.png" },
  { name: "Snacks", image: "/assets/products/maggi_image.png" },
  { name: "Dairy", image: "/assets/products/dairy_product_image.png" },
  { name: "Bakery", image: "/assets/products/bakery_image.png" },
  { name: "FoodGrains", image: "/assets/products/grain_image.png" }
];
${otherExports}`;

    fs.writeFileSync(outputFile, fileContent);
    console.log(`Successfully wrote ${products.length} products to ${outputFile}`);

} catch (err) {
    console.error("Error:", err);
}
