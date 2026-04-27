const express = require('express');
const router = express.Router();

// Dummy data for services (similar to frontend)
const jokiServices = [
  {
    id: 'classic',
    slug: 'classic',
    category: 'classic',
    title: 'Classic Joki',
    description: 'Joki rank klasik dengan berbagai tier',
    artworkPlaceholder: '/characters/default.png',
    badgeColor: '#3B82F6',
    packages: [
      {
        id: 'classic-low',
        serviceId: 'classic',
        name: 'Low Tier',
        subCategory: 'Warrior - Epic',
        price: 4000,
        originalPrice: 5000,
        discountPercent: 20,
        isManual: false,
        isPopular: false,
      },
      // Add more packages as needed
    ],
  },
  // Add more services
];

router.get('/', (req, res) => {
  res.json(jokiServices);
});

module.exports = router;